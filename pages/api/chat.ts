import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { ThreadMessage } from 'openai/resources/beta/threads/messages/messages';
import { Thread } from 'openai/resources/beta/threads/threads';
import { Pool } from 'pg';

import { dispatchToolCall } from './openai-functions';

type ResponseData = {
  messages?: ThreadMessage[];
  error?: any;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
  if (req.method !== 'POST') {
    return res.status(405);
  }

  let responseSent = false; // Flag to track if response has been sent

  const delay = (ms: number) => {
    return new Promise<void>((resolve) => {
      const interval = 100; // Interval to check the flag
      const startTime = Date.now();
      const check = () => {
        if (responseSent || Date.now() - startTime >= ms) {
          clearInterval(timer);
          resolve();
        }
      };
      const timer = setInterval(check, interval);
    });
  };

  try {
    const {
      apiKey,
      postgresUser,
      postgresHost,
      postgresDatabase,
      postgresPassword,
      postgresPort,
      content,
      threadId,
      assistantId,
      lastMessageId,
    } = req.body;

    if (!apiKey) {
      res
        .status(400)
        .json({ error: 'Please provide OpenAI API Key in your request body' });
    }
    if (
      !postgresUser ||
      !postgresHost ||
      !postgresDatabase ||
      !postgresPassword ||
      !postgresPort
    ) {
      return res.status(400).json({
        error:
          'Please provide all required PostgreSQL credentials in your request body',
      });
    }

    const dbConfig = {
      user: postgresUser,
      password: postgresPassword,
      host: postgresHost,
      port: +postgresPort,
      database: postgresDatabase,
    };

    const pool = new Pool(dbConfig);

    const openai = new OpenAI({
      apiKey,
    });

    let thread: Thread;
    if (threadId) {
      thread = await openai.beta.threads.retrieve(threadId);
      await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content,
      });
      thread = await openai.beta.threads.retrieve(threadId);
    } else {
      thread = await openai.beta.threads.create({
        messages: [
          {
            role: 'user',
            content,
          },
        ],
      });
    }
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    let pollingActive = true;

    const pollingHandler = async () => {
      if (!pollingActive) return;

      try {
        const retrievedRun = await openai.beta.threads.runs.retrieve(
          thread.id,
          run.id
        );
        console.log(retrievedRun.status);
        if (
          retrievedRun.status !== 'queued' &&
          retrievedRun.status !== 'in_progress' &&
          retrievedRun.status !== 'requires_action'
        ) {
          clearInterval(pollingId);
        }
        if (retrievedRun.status === 'completed') {
          // return messages back to FE
          let messages: ThreadMessage[];
          if (!lastMessageId) {
            messages = (await openai.beta.threads.messages.list(thread.id))
              .data;
          } else {
            messages = (
              await openai.beta.threads.messages.list(thread.id, {
                after: lastMessageId,
              })
            ).data;
          }
          console.log(messages);
          responseSent = true;
          await pool.end();
          res.status(200).json({ messages });
          return;
        }
        if (retrievedRun.status === 'requires_action') {
          pollingActive = false;
          // need to submit tool outputs
          if (retrievedRun.required_action?.type === 'submit_tool_outputs') {
            const tool_outputs: OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput[] =
              await Promise.all(
                retrievedRun.required_action.submit_tool_outputs.tool_calls.map(
                  async (
                    tool_call
                  ): Promise<OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput> => {
                    console.log(tool_call);
                    return dispatchToolCall(tool_call, pool);
                  }
                )
              );
            console.log(tool_outputs);
            await openai.beta.threads.runs.submitToolOutputs(
              thread.id,
              retrievedRun.id,
              {
                tool_outputs,
              }
            );
          }
          pollingActive = true;
        }
      } catch (error) {
        if (!responseSent) {
          await pool.end();
        }
        console.error(error);
        res.status(500).json({ error: `Error ${error}` });
      }
    };
    const startPolling = () => setInterval(pollingHandler, 1000);
    const pollingId = startPolling();

    await delay(200000);
    clearInterval(pollingId);

    if (!responseSent) {
      await pool.end();
      res
        .status(500)
        .json({ error: 'Internal server error, no response from OpenAI' });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export default handler;

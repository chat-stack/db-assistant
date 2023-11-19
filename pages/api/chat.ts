import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { ThreadMessage } from 'openai/resources/beta/threads/messages/messages';
import { Thread } from 'openai/resources/beta/threads/threads';
import { Client } from 'pg';

type ResponseData = {
  messages?: ThreadMessage[];
  error?: any;
};

interface IGetEntityRelationsArgs {
  table_name: string;
}

interface IGetTableSchemaDdlArgs {
  table_name: string;
}

let client: Client;

const getClient = () => {
  if (client) return client;
  if (
    !process.env.POSTGRES_USER ||
    !process.env.POSTGRES_HOST ||
    !process.env.POSTGRES_DATABASE ||
    !process.env.POSTGRES_PASSWORD ||
    !process.env.POSTGRES_PORT
  ) {
    throw new Error('Missing env variable');
  }
  return new Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: +process.env.POSTGRES_PORT,
  });
};

const get_entity_relations = async (
  tool_call: OpenAI.Beta.Threads.Runs.RequiredActionFunctionToolCall
): Promise<OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput> => {
  const args: IGetEntityRelationsArgs = JSON.parse(
    tool_call.function.arguments
  );
  let tableName = args.table_name;
  if (args.table_name.includes('"')) {
    tableName = args.table_name.replace(/"/g, '');
  }
  const pgClient = getClient();
  await pgClient.connect();
  const data = await pgClient.query(`SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  a.attname AS column_name,
  confrelid::regclass AS referenced_table_name,
  b.attname AS referenced_column_name
FROM
  pg_constraint c
JOIN
  pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
JOIN
  pg_attribute b ON b.attnum = ANY(c.confkey) AND b.attrelid = c.confrelid
WHERE
  contype = 'f'
  AND conrelid::regclass = '${tableName}'::regclass;`);

  pgClient.end();

  return {
    tool_call_id: tool_call.id,
    output: JSON.stringify(
      { relations: data.rows } || {
        success: 'false',
      }
    ),
  };
};

const get_table_schema_ddl = async (
  tool_call: OpenAI.Beta.Threads.Runs.RequiredActionFunctionToolCall
): Promise<OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput> => {
  const args: IGetTableSchemaDdlArgs = JSON.parse(tool_call.function.arguments);
  let tableName = args.table_name;
  if (args.table_name.includes('"')) {
    tableName = args.table_name.replace(/"/g, '');
  }
  const pgClient = getClient();
  await pgClient.connect();
  const data = await pgClient.query(`SELECT
  column_name,
  data_type,
  is_nullable
FROM
  information_schema.columns
WHERE
  table_schema = 'public'
  AND table_name   = '${tableName}';`);

  pgClient.end();

  return {
    tool_call_id: tool_call.id,
    output: JSON.stringify(
      { schema: data.rows } || {
        success: 'false',
      }
    ),
  };
};

const dispatchToolCall = async (
  tool_call: OpenAI.Beta.Threads.Runs.RequiredActionFunctionToolCall
) => {
  if (tool_call.type === 'function') {
    switch (tool_call.function.name) {
      case 'get_entity_relations':
        return get_entity_relations(tool_call);
      case 'get_table_schema_ddl':
        return get_table_schema_ddl(tool_call);
      default:
        break;
    }
  }
  return {
    tool_call_id: tool_call.id,
    output: JSON.stringify({
      success: 'false',
    }),
  };
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) => {
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

  if (req.method !== 'POST') {
    return res.status(405);
  }
  if (!process.env.OPENAI_API_KEY) {
    res.status(405);
  }

  try {
    const { content, threadId, lastMessageId } = req.body;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
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
      assistant_id: 'asst_4jYNnW5NVzZVDg7zDf6vtdVF',
    });
    const pollingHandler = async () => {
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
          messages = (await openai.beta.threads.messages.list(thread.id)).data;
        } else {
          messages = (
            await openai.beta.threads.messages.list(thread.id, {
              after: lastMessageId,
            })
          ).data;
        }
        console.log(messages);
        responseSent = true;
        res.status(200).json({ messages });
        return;
      }
      if (retrievedRun.status === 'requires_action') {
        // need to submit tool outputs
        if (retrievedRun.required_action?.type === 'submit_tool_outputs') {
          const tool_outputs: OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput[] =
            await Promise.all(
              retrievedRun.required_action.submit_tool_outputs.tool_calls.map(
                async (
                  tool_call
                ): Promise<OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput> => {
                  console.log(tool_call);
                  return dispatchToolCall(tool_call);
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
      }
    };
    const startPolling = () => setInterval(pollingHandler, 1000);
    const pollingId = startPolling();

    await delay(30000);
    clearInterval(pollingId);

    if (!responseSent) {
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

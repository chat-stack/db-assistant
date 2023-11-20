import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

import { getPostgresClient } from '../postgres-client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      res
        .status(400)
        .json({ error: 'Please provide OpenAI API Key in your request body' });
    }

    const openai = new OpenAI({
      apiKey,
    });

    const pgClient = getPostgresClient();
    await pgClient.connect();
    const data = await pgClient.query<{ tablename: string }>(
      `SELECT tablename
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public';`
    );
    pgClient.end();
    const tableNames = data.rows.map((row) => {
      return row.tablename;
      ``;
    });
    const myAssistant = await openai.beta.assistants.create({
      instructions: `You are a postgres sql generator. Reply with postgres SQL query without running it.
        
        Note that when generating sql, put table names like user and order in quotes: "user" and "order" because they are reserved terms in postgres.
        
        When generating SQL, don't just give example sql queries, if needed and possible always ask for schema first then generate the actual accurate sql query.
        
        Before asking for table schema, it may be helpful to figure out table entity relations first.
        
        All available table names:
        ${tableNames.join(',')}`,
      name: 'Postgres SQL Generator',
      model: 'gpt-4-1106-preview',
      tools: [
        {
          type: 'function',
          function: {
            name: 'get_table_schema',
            description: 'Get the table schema in the postgres database',
            parameters: {
              type: 'object',
              properties: {
                table_name: {
                  type: 'string',
                  description: 'Table name',
                },
              },
              required: ['table_name'],
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'get_entity_relations',
            description: `Get a table's relations tables and their referenced columns and constraints`,
            parameters: {
              type: 'object',
              properties: {
                table_name: {
                  type: 'string',
                  description: 'Table name',
                },
              },
              required: ['table_name'],
            },
          },
        },
      ],
    });
    res.status(200).json(myAssistant);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export default handler;

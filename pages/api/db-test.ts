import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';

import { get_table_schema } from './openai-functions';

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

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const pgClient = getClient();
    pgClient.connect();
    const tableName = 'product_listing_products';
    const data = await pgClient.query(
      `SELECT
      column_name,
      data_type,
      is_nullable
    FROM
      information_schema.columns
    WHERE
      table_schema = 'public'
      AND table_name = $1;`,
      [tableName]
    );
    pgClient.end();
    console.log(
      get_table_schema({
        id: 'call_IC1FRpeWaPyaXZPg1fUKwmBG',
        type: 'function',
        function: {
          name: 'get_table_schema',
          arguments: '{"table_name":"product_listing_products"}',
        },
      })
    );
    res.status(200).json({ rows: data.rows });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export default handler;

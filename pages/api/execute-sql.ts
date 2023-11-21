import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const {
      postgresUser,
      postgresHost,
      postgresDatabase,
      postgresPassword,
      postgresPort,
      sql,
    } = req.body;
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

    const pgClient = new Client({
      user: postgresUser,
      host: postgresHost,
      database: postgresDatabase,
      password: postgresPassword,
      port: +postgresPort,
    });
    await pgClient.connect();

    const data = await pgClient.query(sql);
    pgClient.end();

    res.status(200).json(data);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export default handler;

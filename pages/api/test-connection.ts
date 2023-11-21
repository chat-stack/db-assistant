import type { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let success = false;
  try {
    const {
      postgresUser,
      postgresHost,
      postgresDatabase,
      postgresPassword,
      postgresPort,
    } = req.body;
    const dbConfig = {
      user: postgresUser,
      password: postgresPassword,
      host: postgresHost,
      port: postgresPort,
      database: postgresDatabase,
    };
    const pool = new Pool(dbConfig);
    try {
      const client = await pool.connect();
      success = true;
      client.release();
    } catch (error) {
      res
        .status(500)
        .json({ error: `Error connecting to PostgreSQL database: ${error}` });
    } finally {
      pool.end();
    }
    res.status(200).json({ success });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error });
  }
};

export default handler;

import { Client } from 'pg';

let client: Client;

export const getPostgresClient = () => {
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

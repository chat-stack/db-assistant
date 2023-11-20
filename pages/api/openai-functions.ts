import OpenAI from 'openai';

import { getPostgresClient } from './postgres-client';

interface IGetEntityRelationsArgs {
  table_name: string;
}

interface IGetTableSchemaDdlArgs {
  table_name: string;
}

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
  const pgClient = getPostgresClient();
  await pgClient.connect();
  const data = await pgClient.query(
    `SELECT
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
    AND conrelid::regclass = '$1'::regclass;`,
    [tableName]
  );

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
  const pgClient = getPostgresClient();
  await pgClient.connect();
  const data = await pgClient.query(
    `SELECT
    column_name,
    data_type,
    is_nullable
  FROM
    information_schema.columns
  WHERE
    table_schema = 'public'
    AND table_name   = '$1';`,
    [tableName]
  );

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

export const dispatchToolCall = async (
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

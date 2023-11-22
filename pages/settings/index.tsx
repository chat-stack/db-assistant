import { Button, Form, Input, message } from 'antd';
import Head from 'next/head';
import OpenAI from 'openai';
import { useState } from 'react';

import useSettingStore from '@/stores/setting.store';

export default function Settings() {
  const {
    openAiApiKey,
    setOpenAiApiKey,
    postgresUser,
    setPostgresUser,
    postgresHost,
    setPostgresHost,
    postgresDatabase,
    setPostgresDatabase,
    postgresPassword,
    setPostgresPassword,
    postgresPort,
    setPostgresPort,
    assistantId,
    setAssistantId,
  } = useSettingStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateAssistant = async () => {
    setIsSubmitting(true);
    const response = await fetch('/api/assistants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: openAiApiKey,
        postgresUser,
        postgresHost,
        postgresDatabase,
        postgresPassword,
        postgresPort,
      }),
    });
    const assistant: OpenAI.Beta.Assistants.Assistant = await response.json();
    if (!assistant || !assistant.id) {
      message.error('Failed to create assistant');
    } else {
      setAssistantId(assistant.id);
    }

    setIsSubmitting(false);
  };

  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    const response = await fetch('/api/test-connection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postgresUser,
        postgresHost,
        postgresDatabase,
        postgresPassword,
        postgresPort,
      }),
    });
    const responseJson = await response.json();
    if (responseJson && responseJson.success) {
      message.success('Test connection succeeded');
    } else {
      message.error(
        `${
          responseJson
            ? responseJson.error?.toString()
            : 'Error: no more details'
        }`
      );
    }
    setIsTestingConnection(false);
  };

  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <main className="flex flex-col items-start justify-between p-24">
        <Form onFinish={handleCreateAssistant}>
          <Form.Item label="ChatGPT API Key" className="w-[64rem] max-w-full">
            <Input.Password
              placeholder="Enter ChatGPT API Key"
              defaultValue={openAiApiKey}
              onChange={(e) => {
                setOpenAiApiKey(e.target.value.toString().trim());
              }}
            />
          </Form.Item>

          <Form.Item label="PostgreSQL User" className="w-[64rem] max-w-full">
            <Input
              placeholder="Enter PostgreSQL User"
              value={postgresUser}
              onChange={(e) => setPostgresUser(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="PostgreSQL Host" className="w-[64rem] max-w-full">
            <Input
              placeholder="Enter PostgreSQL Host"
              value={postgresHost}
              onChange={(e) => setPostgresHost(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            label="PostgreSQL Database"
            className="w-[64rem] max-w-full"
          >
            <Input
              placeholder="Enter PostgreSQL Database"
              value={postgresDatabase}
              onChange={(e) => setPostgresDatabase(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            label="PostgreSQL Password"
            className="w-[64rem] max-w-full"
          >
            <Input.Password
              placeholder="Enter PostgreSQL Password"
              value={postgresPassword}
              onChange={(e) => setPostgresPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="PostgreSQL Port" className="w-[64rem] max-w-full">
            <Input
              placeholder="Enter PostgreSQL Port"
              defaultValue={'5432'}
              value={postgresPort}
              onChange={(e) => setPostgresPort(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            className="w-[64rem] max-w-full"
            style={{ textAlign: 'center' }}
          >
            <Button
              onClick={handleTestConnection}
              loading={isTestingConnection}
              className="mr-1"
            >
              Test Connection
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              className="ml-1"
            >
              Create DB Assistant
            </Button>
          </Form.Item>
          <Form.Item label="Assistant ID" className="w-[64rem] max-w-full">
            <Input
              placeholder="Enter Assistant ID"
              value={assistantId}
              disabled
            />
          </Form.Item>
        </Form>
      </main>
    </>
  );
}

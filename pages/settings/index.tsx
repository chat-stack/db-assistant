import { Button, Form, Input } from 'antd';
import Head from 'next/head';
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
  } = useSettingStore((state) => ({
    openAiApiKey: state.openAiApiKey,
    setOpenAiApiKey: state.setOpenAiApiKey,
    postgresUser: state.postgresUser,
    setPostgresUser: state.setPostgresUser,
    postgresHost: state.postgresHost,
    setPostgresHost: state.setPostgresHost,
    postgresDatabase: state.postgresDatabase,
    setPostgresDatabase: state.setPostgresDatabase,
    postgresPassword: state.postgresPassword,
    setPostgresPassword: state.setPostgresPassword,
    postgresPort: state.postgresPort,
    setPostgresPort: state.setPostgresPort,
  }));

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
    const data = await response.json();
    console.log(data);
    setIsSubmitting(false);
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
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Create DB Assistant
            </Button>
          </Form.Item>
        </Form>
      </main>
    </>
  );
}

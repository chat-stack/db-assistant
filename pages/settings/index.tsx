import { Form, Input } from 'antd';
import Head from 'next/head';

import useSettingStore from '@/stores/setting.store';

export default function Settings() {
  const [chatGptApiKey, setChatGptApiKey, maxTokens, setMaxTokens] =
    useSettingStore((state) => [
      state.chatGptApiKey,
      state.setChatGptApiKey,
      state.maxTokens,
      state.setMaxTokens,
    ]);
  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <main className="flex flex-col items-start justify-between p-24">
        <Form>
          <Form.Item label="ChatGPT API Key" className="w-96">
            <Input
              placeholder="Enter your ChatGPT API Key"
              defaultValue={chatGptApiKey}
              onChange={(e) => {
                setChatGptApiKey(e.target.value.toString().trim());
              }}
            />
          </Form.Item>
          <Form.Item label="ChatGPT number of max tokens" className="w-96">
            <Input
              placeholder="Max tokens"
              defaultValue={maxTokens}
              onChange={(e) => {
                setMaxTokens(parseInt(e.target.value.toString().trim(), 10));
              }}
            />
          </Form.Item>
        </Form>
      </main>
    </>
  );
}

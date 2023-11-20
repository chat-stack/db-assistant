import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import Head from 'next/head';
import { useState } from 'react';

import useSettingStore from '@/stores/setting.store';

export default function Settings() {
  const [openAiApiKey, setOpenAiApiKey] = useSettingStore((state) => [
    state.openAiApiKey,
    state.setOpenAiApiKey,
  ]);
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <>
      <Head>
        <title>Settings</title>
      </Head>
      <main className="flex flex-col items-start justify-between p-24">
        <Form>
          <Form.Item label="ChatGPT API Key" className="w-[64rem] max-w-full">
            <Input
              placeholder="Enter your ChatGPT API Key"
              defaultValue={openAiApiKey}
              onChange={(e) => {
                setOpenAiApiKey(e.target.value.toString().trim());
              }}
              type={passwordVisible ? 'text' : 'password'}
              suffix={
                <Button
                  type="text"
                  icon={
                    passwordVisible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                  onClick={() => setPasswordVisible(!passwordVisible)}
                />
              }
            />
          </Form.Item>
        </Form>
      </main>
    </>
  );
}

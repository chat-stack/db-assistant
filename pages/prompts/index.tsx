import {
  CopyOutlined,
  DeleteOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Alert, Breadcrumb, Button, Input, notification, Table } from 'antd';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

import usePromptsStore from '@/stores/prompts.store';

type TPromptTableKey = 'name' | 'actions';

const columns: {
  title: string;
  dataIndex: TPromptTableKey;
  key: string;
}[] = [
  {
    title: 'Prompt Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
  },
];

export default function Prompts() {
  const router = useRouter();
  const [api, contextHolder] = notification.useNotification();

  const openNotification = () => {
    api.success({
      message: `Copied to clipboard`,
      placement: 'bottom',
    });
  };
  const [shouldShowInfoState, setShouldShowInfoState] = useState(false);
  const [searchTermState, setSearchTermState] = useState(/.*/i);
  const [promptsState, deletePrompt] = usePromptsStore((state) => [
    state.promptsState,
    state.deletePrompt,
  ]);
  const prompts = Object.values(promptsState);

  const handlePromptDelete = (handle: string) => {
    deletePrompt(handle);
  };

  const handlePromptUse = (handle: string) => {
    router.push(`/prompts/use/${handle}`);
  };

  const dataSource: Record<TPromptTableKey, any>[] = prompts
    .filter((prompt) => searchTermState.test(prompt.name))
    .map((prompt) => ({
      name: <Link href={`/prompts/use/${prompt.handle}`}>{prompt.name}</Link>,

      actions: (
        <>
          <Button
            type="primary"
            onClick={() => handlePromptUse(prompt.handle)}
            icon={<EyeOutlined />}
          >
            Use
          </Button>
          <Button
            className="ml-2"
            onClick={() => {
              navigator?.clipboard?.writeText(prompt.content);
              openNotification();
            }}
            icon={<CopyOutlined />}
          >
            Copy Prompt Template to Clipboard
          </Button>

          <Button
            danger
            className="ml-2"
            onClick={() => handlePromptDelete(prompt.handle)}
            icon={<DeleteOutlined />}
          >
            Delete
          </Button>
        </>
      ),
    }));
  return (
    <>
      <Head>
        <title>Prompts</title>
      </Head>
      {contextHolder}
      <Breadcrumb
        className="mr-auto"
        items={[
          {
            title: 'Prompts',
          },
        ]}
      />

      <div className="flex justify-between items-center my-4">
        <Link href="/prompts/new/1">
          <Button type="primary" icon={<PlusOutlined />}>
            Create New Prompt
          </Button>
        </Link>

        <div className="flex items-center">
          <Button
            className="mr-2"
            onClick={() => setShouldShowInfoState(!shouldShowInfoState)}
            icon={<InfoCircleOutlined />}
          >
            How to edit a prompt ?
          </Button>
          <Input.Search
            placeholder="Search prompts"
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={(value) => setSearchTermState(new RegExp(value, 'i'))}
          />
        </div>
      </div>

      {shouldShowInfoState && (
        <Alert
          message="To edit a prompt, copy its template and create a new one instead. So far the reason for this is: we always infer and derive UI components from the prompt template."
          type="info"
          className="mb-4"
        />
      )}

      <Table columns={columns} dataSource={dataSource} rowKey="name" />
    </>
  );
}

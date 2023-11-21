import { PlayCircleOutlined, SendOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { Button, Form, Input, Layout, message, Table, Tabs } from 'antd';
import Head from 'next/head';
import { ThreadMessage } from 'openai/resources/beta/threads/messages/messages';
import { Resizable } from 're-resizable';
import { useEffect, useRef, useState } from 'react';

import Message from '@/components/message';
import useDbChatTabStore from '@/stores/db-chat-tab.store';
import useSettingStore from '@/stores/setting.store';
import useSqlStore from '@/stores/sql.store';

import { IChatLoading } from './chat-loading.interface';

const { Content, Footer } = Layout;
const { TabPane } = Tabs;

export default function DbChat() {
  const {
    openAiApiKey,
    postgresUser,
    postgresHost,
    postgresDatabase,
    postgresPassword,
    postgresPort,
    assistantId,
  } = useSettingStore();
  const [messagesState, setMessagesState] = useState<ThreadMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoadingState, setIsLoadingState] = useState<IChatLoading>({
    currentUserInput: '',
    isLoading: false,
  });
  const chatPaneRef = useRef<HTMLDivElement>(null);

  const threadId =
    messagesState.length > 0 ? messagesState[0].thread_id : undefined;
  const sendMessage = async () => {
    setActiveTab('1');
    if (!openAiApiKey) {
      message.error('Error: OpenAI API Key is missing');
      return;
    }
    if (!assistantId) {
      message.error(
        'Error: Please create an assistant to use in settings page first'
      );
      return;
    }
    if (userInput.trim() !== '') {
      setIsLoadingState({
        isLoading: true,
        currentUserInput: userInput,
      });
      setUserInput(''); // clear input after sending
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            apiKey: openAiApiKey,
            content: userInput,
            threadId,
            assistantId,
            postgresUser,
            postgresHost,
            postgresDatabase,
            postgresPassword,
            postgresPort,
          }),
        });
        const data = await response.json();
        setMessagesState(data.messages || []);
        setIsLoadingState({
          isLoading: false,
          currentUserInput: '',
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // prevent form submission
      sendMessage();
    }
  };

  const { activeTab, setActiveTab } = useDbChatTabStore();

  useEffect(() => {
    scrollToBottom();
  }, [isLoadingState, messagesState, activeTab]);

  const scrollToBottom = () => {
    if (chatPaneRef.current) {
      chatPaneRef.current.scrollTo({
        top: chatPaneRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const { sqlQuery, setSqlQuery } = useSqlStore();
  const [queryResult, setQueryResult] = useState<any>(null); // State to hold query results
  const [queryError, setQueryError] = useState(''); // State to handle query errors
  const [isExecutingSql, setIsExecutingSql] = useState(false);

  const executeSqlQuery = async () => {
    setIsExecutingSql(true);
    try {
      const response = await fetch('/api/execute-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postgresUser,
          postgresHost,
          postgresDatabase,
          postgresPassword,
          postgresPort,
          sql: sqlQuery,
        }),
      });
      const data = await response.json();
      if (response.status === 200) {
        setQueryResult(data);
        setQueryError('');
      } else {
        setQueryResult(data);
        setQueryError(`${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setQueryError(`Error: ${error}`);
    }
    setIsExecutingSql(false);
  };

  return (
    <>
      <Head>
        <title>DB Chat</title>
      </Head>
      <main className="flex flex-col items-center justify-between px-4 min-h-full min-w-full">
        <Layout className="min-w-full">
          <Content className="min-h-full min-w-full">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="w-full mx-auto min-h-full bg-white px-8 py-2 rounded-md"
            >
              <TabPane tab="DB Chat" key="1">
                <div
                  className="max-h-[calc(100vh-16rem)] h-[calc(100vh-16rem)] overflow-y-auto"
                  ref={chatPaneRef}
                >
                  {messagesState &&
                    messagesState.length === 0 &&
                    !isLoadingState.isLoading && (
                      <div className="min-h-full min-w-full h-[calc(100vh-16rem)] flex items-center justify-center">
                        <p className="text-4xl">DB Assistant</p>
                      </div>
                    )}
                  {messagesState.toReversed().map((message) => (
                    <Message key={message.id} message={message} />
                  ))}
                  {isLoadingState.isLoading && (
                    <>
                      <Message
                        key={'currentUserMessage'}
                        message={{
                          role: 'user',
                          content: [
                            {
                              type: 'text',
                              text: {
                                value: isLoadingState.currentUserInput,
                                annotations: [],
                              },
                            },
                          ],
                        }}
                      />
                      <Message
                        key={'loadingAssistantMessage'}
                        message={{
                          role: 'assistant',
                          content: [
                            {
                              type: 'text',
                              text: {
                                value: 'Waiting for Response',
                                annotations: [],
                              },
                            },
                          ],
                        }}
                        isLoading
                      />
                    </>
                  )}
                </div>
              </TabPane>
              <TabPane
                tab="Data and SQL Console"
                key="2"
                className="max-w-full"
              >
                <div className="flex flex-col justify-start items-center h-[calc(100vh-17rem)] max-h-[calc(100vh-17rem)] overflow-y-auto">
                  <Resizable
                    defaultSize={{ width: '100%', height: '320' }}
                    enable={{
                      top: false,
                      right: false,
                      bottom: true,
                      left: false,
                      topRight: false,
                      bottomRight: false,
                      bottomLeft: false,
                      topLeft: false,
                    }}
                    className="border border-gray-300 border-solid rounded-sm"
                  >
                    <Editor
                      height={'100%'}
                      language="sql"
                      defaultValue="-- Write your SQL query here"
                      onChange={(value) => setSqlQuery(value || '')}
                      value={sqlQuery}
                    />
                  </Resizable>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={executeSqlQuery}
                    className="my-4 w-fit-content"
                    loading={isExecutingSql}
                  >
                    Execute SQL
                  </Button>
                  {queryError ? (
                    <p style={{ color: 'red' }}>{queryError}</p>
                  ) : (
                    <>
                      <Table
                        dataSource={
                          queryResult?.rows?.map((row: any) => ({
                            ...row,
                            key: `${JSON.stringify(row)}`,
                          })) || []
                        }
                        columns={queryResult?.fields?.map((field: any) => ({
                          title: field?.name,
                          dataIndex: field?.name,
                          key: field?.name,
                          sorter: (a: any, b: any) =>
                            a[field?.name] - b[field?.name],
                        }))}
                      />
                    </>
                  )}
                </div>
              </TabPane>
            </Tabs>
          </Content>
          <Footer className="text-center min-w-full" style={{ padding: 0 }}>
            <Form className="pt-4">
              <Input
                className="min-w-full"
                placeholder="Message DB Assistant..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                suffix={
                  <Button type="primary" onClick={sendMessage}>
                    <SendOutlined />
                  </Button>
                }
              />
            </Form>
          </Footer>
        </Layout>
      </main>
    </>
  );
}

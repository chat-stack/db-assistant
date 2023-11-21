import { SendOutlined } from '@ant-design/icons';
import { Button, Collapse, Form, Input, Layout, message } from 'antd';
import Head from 'next/head';
import { ThreadMessage } from 'openai/resources/beta/threads/messages/messages';
import { useState } from 'react';

import Message from '@/components/message';
import useSettingStore from '@/stores/setting.store';

import { IChatLoading } from './chat-loading.interface';

const { Content, Footer } = Layout;
const { Panel } = Collapse;

export default function DbChat() {
  const {
    openAiApiKey,
    postgresUser,
    postgresHost,
    postgresDatabase,
    postgresPassword,
    postgresPort,
    assistantId,
  } = useSettingStore((state) => ({
    openAiApiKey: state.openAiApiKey,
    postgresUser: state.postgresUser,
    postgresHost: state.postgresHost,
    postgresDatabase: state.postgresDatabase,
    postgresPassword: state.postgresPassword,
    postgresPort: state.postgresPort,
    assistantId: state.assistantId,
  }));
  const [messagesState, setMessagesState] = useState<ThreadMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoadingState, setIsLoadingState] = useState<IChatLoading>({
    currentUserInput: '',
    isLoading: false,
  });
  const threadId =
    messagesState.length > 0 ? messagesState[0].thread_id : undefined;
  const sendMessage = async () => {
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
        setMessagesState(data.messages || []); // assuming the response data structure
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

  return (
    <>
      <Head>
        <title>DB Chat</title>
      </Head>
      <main className="flex flex-col items-center justify-between px-4 min-h-full min-w-full">
        <Layout className="min-w-full">
          {messagesState &&
            messagesState.length === 0 &&
            !isLoadingState.isLoading && (
              <Content className="min-h-full min-w-full flex items-center justify-center">
                <p className="text-4xl">DB Assistant</p>
              </Content>
            )}
          {(isLoadingState.isLoading ||
            (messagesState && messagesState.length !== 0)) && (
            <Content className="min-h-full min-w-full">
              <Collapse
                defaultActiveKey={['1']}
                className="w-full mx-auto min-h-full"
              >
                <Panel header="DB Chat" key="1">
                  <div
                    style={{
                      maxHeight: 'calc(100vh - 16rem)',
                      overflowY: 'auto',
                    }}
                  >
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
                </Panel>
              </Collapse>
            </Content>
          )}
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

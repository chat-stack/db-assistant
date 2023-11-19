import { RobotOutlined, UserOutlined } from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Breadcrumb,
  Button,
  Collapse,
  Form,
  Input,
  Tabs,
  Tag,
} from 'antd';
import Mustache from 'mustache';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChatCompletionRequestMessage } from 'openai-edge/types/types/chat';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import CodeBlock from '@/components/codeBlock/code-block';
import usePromptsStore from '@/stores/prompts.store';
import useSettingStore from '@/stores/setting.store';

const { Panel } = Collapse;
const { TabPane } = Tabs;

interface IPromptPage {
  handle: string;
}

export default function PromptPage({ handle }: IPromptPage) {
  const [errorMessageState, setErrorMessageState] = useState('');
  const [shouldShowLoadMoreState, setShouldShowLoadMoreState] = useState(false);
  const [dialogState, setDialogState] = useState<
    ChatCompletionRequestMessage[]
  >([]);

  const [promptsState, ,] = usePromptsStore((state) => [
    state.promptsState,
    state.setPrompt,
    state.deletePrompt,
  ]);

  const [chatGptApiKey, maxTokens] = useSettingStore((state) => [
    state.chatGptApiKey,
    state.maxTokens,
  ]);

  const router = useRouter();
  if (!promptsState[handle]) router.push('/prompts');

  const formInitialValues = {
    ...Object.entries(promptsState[handle].variables).reduce(
      (acc: Record<string, string>, [variableName, uiComponent]) => {
        if (variableName && uiComponent.defaultValue !== undefined) {
          acc[variableName] = uiComponent.defaultValue;
        }
        return acc;
      },
      {}
    ),
    input: '',
    rawPrompt: promptsState[handle].content,
    compiledPrompt: '',
  };

  const [form] = Form.useForm();

  const fetchChatGpt = ({ input, ...restValues }: any) => {
    fetch('/api/chatgpt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: promptsState[handle].content,
        values: restValues,
        openAIApiKey: chatGptApiKey,
        maxTokens: maxTokens,
        input: input,
        dialog: dialogState,
      }),
    }).then(async (response) => {
      try {
        const reader = response.body
          ?.pipeThrough(new TextDecoderStream())
          .getReader();
        if (!reader) return;
        // eslint-disable-next-line no-constant-condition
        while (true) {
          // eslint-disable-next-line no-await-in-loop
          const { value, done } = await reader.read();
          if (done) break;
          let dataDone = false;
          const arr = value.split('\n');
          arr.forEach((data) => {
            if (data.length === 0) return; // ignore empty message
            if (data.startsWith(':')) return; // ignore sse comment message
            if (data === 'data: [DONE]') {
              dataDone = true;
              return;
            }
            const json = JSON.parse(data.substring(6));
            setDialogState((prevDialog) => {
              const newDialog = JSON.parse(JSON.stringify(prevDialog));
              if (newDialog.at(-1)?.role !== 'assistant') {
                newDialog.push({ role: 'assistant', content: '' });
              }
              newDialog[newDialog.length - 1].content +=
                json?.choices?.[0]?.delta?.content || '';
              return [...newDialog];
            });
            if (json?.choices?.[0]?.finish_reason === 'length') {
              setShouldShowLoadMoreState(true);
            } else if (json?.choices?.[0]?.finish_reason === 'stop') {
              setShouldShowLoadMoreState(false);
            }
            if (window && document?.body.scrollHeight) {
              window?.scrollTo(0, document.body.scrollHeight);
            }
          });
          if (dataDone) break;
        }
      } catch (e) {
        setErrorMessageState(
          'Faced an error parsing ChatGPT results. Check if your inputs are valid. Or there may be a bug in the application.'
        );
      }
    });
  };

  const onFinish = (values: any) => {
    setErrorMessageState('');
    setDialogState([]);
    fetchChatGpt(values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const handleLoadMore = () => {
    fetchChatGpt(form.getFieldsValue());
  };

  return (
    <div>
      <Head>
        <title>Prompt: {promptsState[handle].name}</title>
      </Head>
      <div className="flex flex-col items-center">
        <div className="flex justify-start w-full">
          <Breadcrumb
            className="mr-auto"
            items={[
              {
                title: <Link href="/prompts">Prompts</Link>,
              },
              {
                title: 'Use',
              },
              {
                title: `${promptsState[handle].name}`,
              },
            ]}
          />
        </div>
        <br />
        <Collapse defaultActiveKey={['1']} className="w-full mx-auto">
          <Panel header="Prompt" key="1">
            <Form
              form={form}
              layout="vertical"
              initialValues={formInitialValues}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              className="w-full mx-auto"
            >
              <Tabs
                defaultActiveKey="1"
                onChange={(key) => {
                  if (key === '3') {
                    form.setFieldsValue({
                      compiledPrompt: Mustache.render(
                        form.getFieldValue('rawPrompt'),
                        form.getFieldsValue()
                      ),
                    });
                  }
                }}
              >
                <TabPane tab="UI Prompt" key="1">
                  {Object.entries(promptsState[handle].variables).map(
                    ([variableName, uiComponent]) => {
                      switch (uiComponent.type) {
                        case 'TextBox':
                          return (
                            <Form.Item
                              label={
                                <span>
                                  {
                                    promptsState[handle].variables[variableName]
                                      .displayName
                                  }
                                  <Tag className="mx-2">{variableName}</Tag>
                                </span>
                              }
                              name={variableName}
                              key={variableName}
                              rules={[
                                {
                                  required: true,
                                  message: 'This field is required',
                                },
                              ]}
                            >
                              <Input className="w-full mx-auto" />
                            </Form.Item>
                          );
                        default:
                          break;
                      }
                    }
                  )}

                  <Form.Item
                    label={'Input'}
                    name={'input'}
                    key={'input'}
                    rules={[{ required: true, message: 'Input is required' }]}
                  >
                    <Input.TextArea rows={6} />
                  </Form.Item>

                  <Form.Item className="flex justify-center">
                    <Button type="primary" htmlType="submit">
                      Submit
                    </Button>
                  </Form.Item>
                </TabPane>

                <TabPane tab="Raw Prompt" key="2">
                  <Alert
                    message="You can temporarily overwrite raw prompt here. To add variables or edit & save this prompt, consider creating a new prompt and use it intead"
                    type="info"
                    className="mb-4"
                  />
                  <Form.Item name="rawPrompt" key="rawPrompt">
                    <Input.TextArea rows={6} />
                  </Form.Item>
                </TabPane>

                <TabPane tab="Compiled Prompt" key="3">
                  <Form.Item name="compiledPrompt" key="compiledPrompt">
                    <Input.TextArea rows={6} disabled />
                  </Form.Item>
                </TabPane>
              </Tabs>
            </Form>
          </Panel>
        </Collapse>
        <br />
        {dialogState && dialogState.length !== 0 && (
          <Collapse defaultActiveKey={['1']} className="w-full mx-auto">
            <Panel header="Output" key="1">
              {errorMessageState ? (
                <div className="flex justify-center">
                  <Alert message={errorMessageState} type="error" />
                </div>
              ) : (
                <>
                  {dialogState.map((dialog) => (
                    <div
                      className="flex flex-row justify-center space-x-4 border-b-4 border-gray-300 pb-4"
                      key={`${dialog.role}/${dialog.content}`}
                    >
                      <div className="flex">
                        <Avatar
                          shape="square"
                          size={48}
                          icon={
                            dialog.role === 'assistant' ? (
                              <RobotOutlined />
                            ) : (
                              <UserOutlined />
                            )
                          }
                          className={
                            dialog.role === 'assistant'
                              ? 'mt-4 bg-green-400'
                              : 'mt-4 bg-blue-400'
                          }
                        />
                      </div>
                      <div className="w-full mx-auto">
                        <ReactMarkdown
                          remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
                          components={{
                            code(props) {
                              return <CodeBlock {...props}></CodeBlock>;
                            },
                          }}
                        >
                          {dialog.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-center space-x-4">
                    {dialogState && dialogState.length !== 0 && (
                      <>
                        <Button
                          type="primary"
                          disabled={!shouldShowLoadMoreState}
                          onClick={handleLoadMore}
                        >
                          Load More
                        </Button>
                        <Button type="primary">Ask Follow Up</Button>
                      </>
                    )}
                  </div>
                </>
              )}
            </Panel>
          </Collapse>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<IPromptPage> = async (
  context
) => {
  const { handle } = context.query;
  if (typeof handle !== 'string') {
    context.res.writeHead(302, { Location: '/prompts' });
    context.res.end();
    return { props: { handle: '' } };
  }

  return {
    props: {
      handle: handle,
    },
  };
};

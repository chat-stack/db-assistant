import { RobotOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Spin } from 'antd';
import { ThreadMessage } from 'openai/resources/beta/threads/messages/messages';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import CodeBlock from '../codeBlock/code-block';

interface MessageProps {
  message: Partial<ThreadMessage>;
  isLoading?: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isLoading }) => {
  return (
    <div
      className="flex flex-row justify-center space-x-4 border-b-4 border-gray-300 pb-4"
      key={`${message.role}/${message.content}`}
    >
      <div className="flex">
        <Avatar
          shape="square"
          size={48}
          icon={
            message.role === 'assistant' ? <RobotOutlined /> : <UserOutlined />
          }
          className={
            message.role === 'assistant'
              ? 'mt-4 bg-green-400'
              : 'mt-4 bg-blue-400'
          }
        />
      </div>
      <div className="w-full mx-auto">
        {isLoading ? (
          <div className="w-full mx-auto mt-4">
            <Spin />
          </div>
        ) : (
          <ReactMarkdown
            remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
            components={{
              code(props) {
                return <CodeBlock {...props}></CodeBlock>;
              },
            }}
          >
            {message.content
              ?.map((content) => {
                if (content.type === 'text') {
                  return content.text.value;
                } else {
                  return '';
                }
              })
              .join('\n') || ''}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default Message;

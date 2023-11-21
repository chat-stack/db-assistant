import { CodeOutlined, CopyOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useState } from 'react';
import { CodeProps } from 'react-markdown/lib/ast-to-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import oneDark from 'react-syntax-highlighter/dist/cjs/styles/prism/one-dark';

import useDbChatTabStore from '@/stores/db-chat-tab.store';
import useSqlStore from '@/stores/sql.store';

export default function CodeBlock({
  inline,
  className,
  children,
  ...props
}: CodeProps) {
  const match = /language-(\w+)/.exec(className || '');
  const text = String(children).replace(/\n$/, '');

  const [copied, setCopied] = useState(false);

  const { setSqlQuery } = useSqlStore();

  const { setActiveTab } = useDbChatTabStore();

  const copyToClipboard = () => {
    navigator?.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000); // Reset after 3 seconds
  };

  const copyToSqlConsole = () => {
    setSqlQuery(text);
    setActiveTab('2');
  };
  return !inline && match ? (
    <div className="relative">
      <div className="absolute right-0 top-0">
        <Button
          onClick={copyToClipboard}
          className="text-xs text-gray-300 hover:text-white my-0.5 border-none rounded-md pr-2"
          style={{
            backgroundColor: 'rgb(40, 44, 52)',
          }}
          type="ghost"
          icon={<CopyOutlined />}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button
          onClick={copyToSqlConsole}
          className="text-xs text-gray-300 hover:text-white my-0.5 border-none rounded-md pl-2"
          style={{
            backgroundColor: 'rgb(40, 44, 52)',
          }}
          type="ghost"
          icon={<CodeOutlined />}
        >
          Copy to SQL Console
        </Button>
      </div>

      <SyntaxHighlighter
        {...props}
        style={oneDark}
        language={match[1]}
        PreTag="div"
        className="overflow-x-auto"
      >
        {text}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code {...props} className={className}>
      {children}
    </code>
  );
}

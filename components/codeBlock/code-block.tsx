import { CopyOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useState } from 'react';
import { CodeProps } from 'react-markdown/lib/ast-to-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import oneDark from 'react-syntax-highlighter/dist/cjs/styles/prism/one-dark';

export default function CodeBlock({
  inline,
  className,
  children,
  ...props
}: CodeProps) {
  const match = /language-(\w+)/.exec(className || '');
  const text = String(children).replace(/\n$/, '');

  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator?.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000); // Reset after 3 seconds
  };
  return !inline && match ? (
    <div className="relative">
      <Button
        onClick={copyToClipboard}
        className="absolute right-0 top-0 text-xs text-gray-300 hover:text-white my-0.5 border-none rounded-md "
        style={{
          backgroundColor: 'rgb(40, 44, 52)',
        }}
        type="ghost"
        icon={<CopyOutlined />}
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>

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

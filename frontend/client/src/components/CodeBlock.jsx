// frontend/client/src/components/CodeBlock.jsx

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const customTheme = {
    'code[class*="language-"]': { color: '#111827' },
    'pre[class*="language-"]': { color: '#111827' },
    'keyword': { color: '#4338ca' },
    'string': { color: '#0b7853' },
    'comment': { color: '#111827', fontStyle: 'italic' },
    'function': { color: '#a22525' },
    'number': { color: '#111827' },
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <span className="code-language">{language}</span>
        <button
          onClick={handleCopy}
          className="code-copy-btn"
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>
      <div className="code-content">
        <SyntaxHighlighter
          language={language}
          style={customTheme}
          customStyle={{
            margin: 0,
            padding: 0,
            background: 'transparent',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
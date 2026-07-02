import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'

// Zero-dependency syntax tokenizer for common languages (Python, JS, etc.)
const tokenizeCode = (code, language) => {
  const rules = [
    { type: 'comment', regex: /(\/\/.*|#.*)/ },
    { type: 'string', regex: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/ },
    { type: 'keyword', regex: /\b(const|let|var|function|return|import|export|from|class|def|if|else|elif|for|while|in|as|try|except|await|async|with|lambda|yield|self|None|True|False|and|or|not)\b/ },
    { type: 'number', regex: /\b(\d+)\b/ },
    { type: 'function', regex: /\b([a-zA-Z_]\w*)(?=\()/ },
  ]

  const combinedRegex = new RegExp(
    rules.map(r => `(${r.regex.source})`).join('|'),
    'g'
  )

  const parts = []
  let lastIndex = 0;
  let match;

  while ((match = combinedRegex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      parts.push(code.substring(lastIndex, match.index))
    }

    let matchedType = null
    let matchedText = ''

    for (let i = 0; i < rules.length; i++) {
      if (match[i + 1] !== undefined) {
        matchedType = rules[i].type
        matchedText = match[i + 1]
        break
      }
    }

    if (matchedType) {
      parts.push(
        <span key={match.index} className={`token ${matchedType}`}>
          {matchedText}
        </span>
      )
    } else {
      parts.push(match[0])
    }

    lastIndex = combinedRegex.lastIndex
  }

  if (lastIndex < code.length) {
    parts.push(code.substring(lastIndex))
  }

  return parts.length > 0 ? parts : code
}

function Message({ message, isStreaming = false }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const timestamp = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className={`message ${isUser ? 'user' : 'assistant'} ${isStreaming ? 'streaming' : ''}`}>
      <div className="message-avatar">
        {isUser ? '👤' : '🤖'}
      </div>

      <div className="message-content">
        <div className="message-header">
          <span className="message-author">
            {isUser ? 'You' : 'Orphic'}
          </span>
          <span className="message-time">{timestamp}</span>
        </div>

        <div className="message-body">
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  const codeString = String(children).replace(/\n$/, '')
                  
                  // Check if this is a block code or inline code
                  const isInline = !className
                  
                  return !isInline && match ? (
                    <div className="code-block">
                      <div className="code-header">
                        <span>{match[1]}</span>
                        <button onClick={() => navigator.clipboard.writeText(codeString)}>
                          Copy
                        </button>
                      </div>
                      <pre className={className} {...props}>
                        <code>{tokenizeCode(codeString, match[1])}</code>
                      </pre>
                    </div>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
          {isStreaming && <span className="cursor-blink">▊</span>}
        </div>

        {!isUser && !isStreaming && (
          <div className="message-actions">
            <button
              className={`action-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? '✓ Copied' : '⎘ Copy'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Message

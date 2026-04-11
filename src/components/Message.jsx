import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'

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
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <div className="code-block">
                      <div className="code-header">
                        <span>{match[1]}</span>
                        <button onClick={() => navigator.clipboard.writeText(String(children))}>
                          Copy
                        </button>
                      </div>
                      <pre className={className} {...props}>
                        <code>{children}</code>
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
            <button className="action-btn" title="Regenerate response">
              ↻ Regenerate
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Message

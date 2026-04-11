import React, { useState, useRef, useEffect, useCallback } from 'react'
import Message from './Message'
import ReasoningPanel from './ReasoningPanel'
import { useWebSocket } from '../hooks/useWebSocket'

function Chat({ thread, onUpdateTitle, onUpdateMessages, onNewThread }) {
  const [inputValue, setInputValue] = useState('')
  const [showReasoning, setShowReasoning] = useState(false)
  const [localMessages, setLocalMessages] = useState([])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Use thread messages or local if no thread
  const messages = thread?.messages || localMessages

  const { isConnected, isStreaming, streamingContent, sendMessage } = useWebSocket(
    thread?.id
  )

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent])

  // Focus input when thread changes
  useEffect(() => {
    inputRef.current?.focus()
  }, [thread?.id])

  // Update title based on first user message
  useEffect(() => {
    if (thread && messages.length > 0 && thread.title === 'New Chat') {
      const firstUserMessage = messages.find(m => m.role === 'user')
      if (firstUserMessage) {
        const title = firstUserMessage.content.slice(0, 30) + '...'
        onUpdateTitle(thread.id, title)
      }
    }
  }, [thread, messages, onUpdateTitle])

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || !thread) return

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now()
    }

    // Add user message
    const newMessages = [...messages, userMessage]
    if (thread) {
      onUpdateMessages(thread.id, newMessages)
    } else {
      setLocalMessages(newMessages)
    }

    // Clear input
    setInputValue('')

    // Send via WebSocket
    sendMessage(userMessage.content)
  }, [inputValue, thread, messages, onUpdateMessages, sendMessage])

  // Handle streaming completion
  useEffect(() => {
    if (!isStreaming && streamingContent && thread) {
      // Streaming finished, save the complete message
      const lastMessage = messages[messages.length - 1]
      if (lastMessage?.role === 'assistant') {
        // Update existing assistant message
        const updatedMessages = messages.map((m, idx) =>
          idx === messages.length - 1
            ? { ...m, content: streamingContent }
            : m
        )
        onUpdateMessages(thread.id, updatedMessages)
      } else {
        // Add new assistant message
        const assistantMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: streamingContent,
          timestamp: Date.now()
        }
        onUpdateMessages(thread.id, [...messages, assistantMessage])
      }
    }
  }, [isStreaming, streamingContent, thread, messages, onUpdateMessages])

  // Add streaming message to display
  const displayMessages = [...messages]
  if (isStreaming && streamingContent) {
    // Check if last message is already an assistant message being updated
    const lastMessage = displayMessages[displayMessages.length - 1]
    if (lastMessage?.role === 'assistant') {
      lastMessage.content = streamingContent
    } else {
      displayMessages.push({
        id: 'streaming',
        role: 'assistant',
        content: streamingContent,
        timestamp: Date.now()
      })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasMessages = displayMessages.length > 0

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-left">
          {thread && (
            <>
              <h1>{thread.title || 'New Chat'}</h1>
              <span className={`connection-badge ${isConnected ? 'connected' : 'disconnected'}`}>
                {isConnected ? '● Live' : '○ Disconnected'}
              </span>
            </>
          )}
        </div>
        <div className="header-actions">
          <button
            className={`reasoning-btn ${showReasoning ? 'active' : ''}`}
            onClick={() => setShowReasoning(!showReasoning)}
            title="Toggle reasoning panel"
          >
            🧠 Reasoning
          </button>
          <button className="settings-btn" title="Settings">
            ⚙
          </button>
        </div>
      </div>

      <div className={`chat-layout ${showReasoning ? 'with-panel' : ''}`}>
        <div className="messages-container">
          {!thread ? (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-logo">◈</div>
                <h1>Welcome to Orphic</h1>
                <p>An autonomous AI platform for deep research and multi-step reasoning.</p>
                <div className="feature-cards">
                  <div className="feature-card">
                    <span className="feature-icon">🎯</span>
                    <h3>Multi-Agent Orchestration</h3>
                    <p>Specialized agents for planning, execution, and monitoring</p>
                  </div>
                  <div className="feature-card">
                    <span className="feature-icon">🔍</span>
                    <h3>Deep Research</h3>
                    <p>Web search, code execution, and real-time data access</p>
                  </div>
                  <div className="feature-card">
                    <span className="feature-icon">🧠</span>
                    <h3>Advanced Reasoning</h3>
                    <p>Chain-of-thought, reflection, and tree-of-thought</p>
                  </div>
                </div>
                <button className="start-chat-btn" onClick={onNewThread}>
                  Start a New Chat
                </button>
              </div>
            </div>
          ) : !hasMessages ? (
            <div className="empty-chat">
              <p>Send a message to start the conversation...</p>
            </div>
          ) : (
            <div className="messages-list">
              {displayMessages.map((message) => (
                <Message
                  key={message.id}
                  message={message}
                  isStreaming={message.id === 'streaming'}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {showReasoning && (
          <ReasoningPanel
            isOpen={showReasoning}
            onClose={() => setShowReasoning(false)}
          />
        )}
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={thread ? "Message Orphic..." : "Start a new chat to begin..."}
            disabled={!thread || isStreaming}
            rows={1}
            style={{
              minHeight: '24px',
              maxHeight: '200px'
            }}
          />
          <div className="input-actions">
            <span className="input-hint">
              {isStreaming ? 'Generating...' : 'Press Enter to send'}
            </span>
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!inputValue.trim() || !thread || isStreaming}
            >
              {isStreaming ? (
                <span className="spinner">◌</span>
              ) : (
                '➤'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat

import React, { useState, useRef, useEffect, useCallback } from 'react'
import Message from './Message'
import ReasoningPanel from './ReasoningPanel'
import { useWebSocket } from '../hooks/useWebSocket'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function Chat({ thread, onUpdateTitle, onUpdateMessages, onNewThread }) {
  const [inputValue, setInputValue] = useState('')
  const [showReasoning, setShowReasoning] = useState(false)
  const [localMessages, setLocalMessages] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)

  const messages = thread?.messages || localMessages

  const { isConnected, isStreaming, streamingContent, sendMessage } = useWebSocket(
    thread?.id
  )

  // 1. Fetch conversation history from Neon DB / LangGraph checkpointer
  useEffect(() => {
    if (!thread?.id) return

    const token = localStorage.getItem('orphic-token')
    if (!token) return

    fetch(`${BACKEND_URL}/api/v1/conversations/${thread.id}/messages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.ok) return res.json()
        throw new Error('Failed to load chat history')
      })
      .then(data => {
        // Map backend history format to frontend message state
        const mappedMessages = data.messages.map((m, index) => ({
          id: `${thread.id}-${index}`,
          role: m.role,
          content: m.content,
          timestamp: Date.now()
        }))
        onUpdateMessages(thread.id, mappedMessages)
      })
      .catch(err => {
        console.error('Failed to load message history:', err)
      })
  }, [thread?.id, onUpdateMessages])

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
    setSelectedFile(null) // clear file on chat switch
  }, [thread?.id])

  // Update thread title based on the first user message
  useEffect(() => {
    if (thread && messages.length > 0 && thread.title === 'New Chat') {
      const firstUserMsg = messages.find(m => m.role === 'user')
      if (firstUserMsg) {
        const title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '')
        onUpdateTitle(thread.id, title)
      }
    }
  }, [thread, messages, onUpdateTitle])

  const handleSend = useCallback(async () => {
    if ((!inputValue.trim() && !selectedFile) || !thread) return

    let userMessageContent = inputValue.trim()
    if (selectedFile && !userMessageContent) {
      userMessageContent = `Uploaded file: ${selectedFile.name}`
    }

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessageContent,
      timestamp: Date.now()
    }

    const newMessages = [...messages, userMessage]
    onUpdateMessages(thread.id, newMessages)

    setInputValue('')
    const fileToSend = selectedFile
    setSelectedFile(null)

    // Stream the message + file attachment via fetch SSE
    await sendMessage(inputValue.trim(), fileToSend)
  }, [inputValue, thread, messages, onUpdateMessages, selectedFile, sendMessage])

  // Handle streaming response updates
  useEffect(() => {
    if (!isStreaming && streamingContent && thread) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage?.role === 'assistant') {
        const updatedMessages = messages.map((m, idx) =>
          idx === messages.length - 1 ? { ...m, content: streamingContent } : m
        )
        onUpdateMessages(thread.id, updatedMessages)
      } else {
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

  const displayMessages = [...messages]
  if (isStreaming && streamingContent) {
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
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
              <p>Send a message or upload a document/image to start the conversation...</p>
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
          {selectedFile && (
            <div className="file-preview-pill">
              <span className="file-icon">
                {selectedFile.type.startsWith('image/') ? '🖼️' : '📄'}
              </span>
              <span className="file-name">{selectedFile.name}</span>
              <button className="remove-file-btn" onClick={() => setSelectedFile(null)}>✕</button>
            </div>
          )}
          
          <div className="input-row">
            <button 
              className="attach-btn" 
              onClick={handleAttachmentClick}
              title="Attach document (PDF/CSV/Excel/Text) or Image"
              disabled={!thread || isStreaming}
            >
              📎
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }}
              accept=".pdf,.csv,.xlsx,.xls,.txt,.md,.jpg,.jpeg,.png,.webp"
            />
            
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={thread ? "Message Orphic or ask about a file..." : "Start a new chat to begin..."}
              disabled={!thread || isStreaming}
              rows={1}
              style={{
                minHeight: '24px',
                maxHeight: '200px'
              }}
            />
          </div>
          
          <div className="input-actions">
            <span className="input-hint">
              {isStreaming ? 'Generating...' : 'Press Enter to send'}
            </span>
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={(!inputValue.trim() && !selectedFile) || !thread || isStreaming}
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

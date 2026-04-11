import React from 'react'

function Sidebar({
  threads,
  currentThreadId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
  isOpen,
  onToggle
}) {
  const formatDate = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button className="sidebar-toggle" onClick={onToggle}>
        {isOpen ? '✕' : '☰'}
      </button>

      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">Orphic</span>
          </div>
          <button className="new-chat-btn" onClick={onNewThread}>
            <span>+</span>
            New Chat
          </button>
        </div>

        <div className="threads-list">
          {threads.length === 0 ? (
            <div className="empty-threads">
              No conversations yet
            </div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.id}
                className={`thread-item ${currentThreadId === thread.id ? 'active' : ''}`}
                onClick={() => onSelectThread(thread.id)}
              >
                <div className="thread-info">
                  <span className="thread-title">
                    {thread.title || 'New Chat'}
                  </span>
                  <span className="thread-date">
                    {formatDate(thread.createdAt)}
                  </span>
                </div>
                <button
                  className="delete-thread-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteThread(thread.id)
                  }}
                  title="Delete conversation"
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <div className="connection-status">
            <span className="status-dot" id="status-dot"></span>
            <span id="status-text">Ready</span>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

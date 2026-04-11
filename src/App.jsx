import React, { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import './styles/App.css'

function App() {
  // Thread management
  const [threads, setThreads] = useState(() => {
    const saved = localStorage.getItem('orphic-threads')
    return saved ? JSON.parse(saved) : []
  })
  const [currentThreadId, setCurrentThreadId] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Save threads to localStorage
  React.useEffect(() => {
    localStorage.setItem('orphic-threads', JSON.stringify(threads))
  }, [threads])

  const createNewThread = useCallback(() => {
    const newThread = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      messages: []
    }
    setThreads(prev => [newThread, ...prev])
    setCurrentThreadId(newThread.id)
  }, [])

  const deleteThread = useCallback((threadId) => {
    setThreads(prev => prev.filter(t => t.id !== threadId))
    if (currentThreadId === threadId) {
      setCurrentThreadId(null)
    }
  }, [currentThreadId])

  const updateThreadTitle = useCallback((threadId, title) => {
    setThreads(prev => prev.map(t =>
      t.id === threadId ? { ...t, title } : t
    ))
  }, [])

  const updateThreadMessages = useCallback((threadId, messages) => {
    setThreads(prev => prev.map(t =>
      t.id === threadId ? { ...t, messages } : t
    ))
  }, [])

  const currentThread = threads.find(t => t.id === currentThreadId)

  return (
    <div className="app">
      <Sidebar
        threads={threads}
        currentThreadId={currentThreadId}
        onSelectThread={setCurrentThreadId}
        onNewThread={createNewThread}
        onDeleteThread={deleteThread}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Chat
          thread={currentThread}
          onUpdateTitle={updateThreadTitle}
          onUpdateMessages={updateThreadMessages}
          onNewThread={createNewThread}
        />
      </main>
    </div>
  )
}

export default App

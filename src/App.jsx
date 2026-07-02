import React, { useState, useCallback, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import Auth from './components/Auth'
import './styles/App.css'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('orphic-token'))
  const [threads, setThreads] = useState([])
  const [currentThreadId, setCurrentThreadId] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Fetch threads from Neon Postgres DB via API
  const fetchThreads = useCallback(async () => {
    if (!token) return
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/conversations/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setThreads(data.map(t => ({
          id: t.id,
          title: t.title,
          createdAt: t.created_at,
          messages: [] // loaded dynamically on click
        })))
      } else if (response.status === 401) {
        handleLogout()
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
    }
  }, [token])

  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  const createNewThread = useCallback(() => {
    // Generate frontend client-side UUID.
    // The backend will auto-register this UUID in the 'conversations' SQL table
    // upon receiving the first message/upload on the stream router.
    const newId = crypto.randomUUID()
    const newThread = {
      id: newId,
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      messages: []
    }
    setThreads(prev => [newThread, ...prev])
    setCurrentThreadId(newId)
  }, [])

  const deleteThread = useCallback(async (threadId) => {
    setThreads(prev => prev.filter(t => t.id !== threadId))
    if (currentThreadId === threadId) {
      setCurrentThreadId(null)
    }
    try {
      await fetch(`${BACKEND_URL}/api/v1/conversations/${threadId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
    } catch (err) {
      console.error('Failed to delete thread:', err)
    }
  }, [currentThreadId, token])

  const updateThreadTitle = useCallback(async (threadId, title) => {
    setThreads(prev => prev.map(t =>
      t.id === threadId ? { ...t, title } : t
    ))
    try {
      await fetch(`${BACKEND_URL}/api/v1/conversations/${threadId}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
      })
    } catch (err) {
      console.error('Failed to update thread title:', err)
    }
  }, [token])

  const updateThreadMessages = useCallback((threadId, messages) => {
    setThreads(prev => prev.map(t =>
      t.id === threadId ? { ...t, messages } : t
    ))
  }, [])

  const handleLogout = useCallback(() => {
    setToken(null)
    setThreads([])
    setCurrentThreadId(null)
    localStorage.removeItem('orphic-token')
  }, [])

  if (!token) {
    return <Auth onAuthSuccess={(newToken) => setToken(newToken)} />
  }

  const currentThread = threads.find(t => t.id === currentThreadId)

  return (
    <div className="app">
      <Sidebar
        threads={threads}
        currentThreadId={currentThreadId}
        onSelectThread={setCurrentThreadId}
        onNewThread={createNewThread}
        onDeleteThread={deleteThread}
        onLogout={handleLogout}
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

import { useState, useCallback, useRef, useEffect } from 'react'

const BACKEND_URL = 'http://localhost:8000'

export function useWebSocket(threadId) {
  const [isConnected, setIsConnected] = useState(true)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const abortControllerRef = useRef(null)

  const sendMessage = useCallback(async (content, file = null) => {
    if (!threadId) return false

    const token = localStorage.getItem('orphic-token')
    if (!token) {
      console.error('No auth token found')
      return false
    }

    setIsStreaming(true)
    setStreamingContent('')

    // Abort previous stream if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    const formData = new FormData()
    formData.append('session_id', threadId)
    if (content) formData.append('message', content)
    if (file) formData.append('file', file)

    try {
      const response = await fetch(`${BACKEND_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6)
            if (data.startsWith('[Error:')) {
              console.error(data)
              setStreamingContent(prev => prev + `\n${data}`)
            } else {
              setStreamingContent(prev => prev + data)
            }
          }
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Streaming failed:', error)
        if (error.message === 'Unauthorized') {
          // Trigger token wipe
          localStorage.removeItem('orphic-token')
          window.location.reload()
        }
      }
    } finally {
      setIsStreaming(false)
    }

    return true
  }, [threadId])

  const disconnect = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsStreaming(false)
  }, [])

  useEffect(() => {
    return () => disconnect()
  }, [disconnect])

  return {
    isConnected,
    isStreaming,
    streamingContent,
    sendMessage,
    connect: () => {},
    disconnect
  }
}

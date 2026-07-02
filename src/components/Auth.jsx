import React, { useState } from 'react'

function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const backend_url = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const url = isLogin 
      ? `${backend_url}/auth/jwt/login` 
      : `${backend_url}/auth/register`

    const body = isLogin 
      ? new URLSearchParams({ username: email, password })
      : JSON.stringify({ email, password })

    const headers = isLogin 
      ? { 'Content-Type': 'application/x-www-form-urlencoded' }
      : { 'Content-Type': 'application/json' }

    try {
      const response = await fetch(url, { method: 'POST', headers, body })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Authentication failed. Please check credentials.')
      }

      const data = await response.json()
      
      if (isLogin) {
        localStorage.setItem('orphic-token', data.access_token)
        onAuthSuccess(data.access_token)
      } else {
        setIsLogin(true)
        alert('Account registered successfully! Please log in.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-icon">◈</span>
          <h2>{isLogin ? 'Welcome to Orphic' : 'Create an Account'}</h2>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Enter your credentials to access the reasoning platform' 
              : 'Sign up to start secure multi-user research sessions'
            }
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error-banner">{error}</div>}
          
          <div className="auth-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@domain.com"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="auth-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? <span className="spinner">◌</span> : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>
        
        <div className="auth-footer">
          <span onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? "Don't have an account? Register here" : 'Already have an account? Log in'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Auth

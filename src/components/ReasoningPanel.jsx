import React, { useState } from 'react'

// Future-proof component for displaying agent reasoning and multi-step thinking
function ReasoningPanel({ isOpen, onClose, reasoningSteps = [] }) {
  const [activeTab, setActiveTab] = useState('reasoning')

  // Placeholder data structure for future agentic features
  const defaultSteps = [
    {
      id: 1,
      type: 'plan',
      title: 'Planning',
      description: 'Breaking down the task into sub-steps',
      status: 'complete',
      timestamp: Date.now()
    },
    {
      id: 2,
      type: 'tool',
      title: 'Tool Execution',
      description: 'Calling web search API',
      status: 'complete',
      timestamp: Date.now()
    },
    {
      id: 3,
      type: 'think',
      title: 'Reasoning',
      description: 'Analyzing search results',
      status: 'active',
      timestamp: Date.now()
    }
  ]

  const steps = reasoningSteps.length > 0 ? reasoningSteps : defaultSteps

  if (!isOpen) return null

  return (
    <div className="reasoning-panel">
      <div className="panel-header">
        <div className="panel-tabs">
          <button
            className={`tab ${activeTab === 'reasoning' ? 'active' : ''}`}
            onClick={() => setActiveTab('reasoning')}
          >
            Reasoning
          </button>
          <button
            className={`tab ${activeTab === 'tools' ? 'active' : ''}`}
            onClick={() => setActiveTab('tools')}
          >
            Tools
          </button>
          <button
            className={`tab ${activeTab === 'agents' ? 'active' : ''}`}
            onClick={() => setActiveTab('agents')}
          >
            Agents
          </button>
        </div>
        <button className="close-panel" onClick={onClose}>✕</button>
      </div>

      <div className="panel-content">
        {activeTab === 'reasoning' && (
          <div className="reasoning-steps">
            {steps.map((step, index) => (
              <div key={step.id} className={`step ${step.status}`}>
                <div className="step-indicator">
                  {step.status === 'complete' && '✓'}
                  {step.status === 'active' && <span className="spinner">◌</span>}
                  {step.status === 'pending' && '○'}
                </div>
                <div className="step-content">
                  <div className="step-title">{step.title}</div>
                  <div className="step-description">{step.description}</div>
                </div>
                {index < steps.length - 1 && <div className="step-connector" />}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="tools-panel">
            <p className="placeholder-text">
              Tool calls and results will appear here...
            </p>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="agents-panel">
            <p className="placeholder-text">
              Multi-agent orchestration view coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReasoningPanel

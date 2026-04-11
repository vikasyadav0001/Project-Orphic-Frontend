# Orphic Frontend

A modern React-based chat interface for the Orphic AI platform.

## Features

- **Real-time Streaming**: WebSocket-powered token-by-token message streaming
- **Thread Management**: Create, switch, and delete conversation threads
- **Dark Mystical Theme**: Elegant obsidian UI with purple/cyan accents
- **Reasoning Panel**: Future-ready for agent reasoning visualization
- **Code Highlighting**: Syntax-highlighted code blocks with copy functionality
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- React 18
- Vite (build tool)
- WebSocket API
- CSS3 with custom properties

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend server running on `localhost:8000`

### Installation

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Chat.jsx          # Main chat interface
│   │   ├── Message.jsx       # Individual message component
│   │   ├── ReasoningPanel.jsx # Agent reasoning visualization
│   │   └── Sidebar.jsx       # Thread sidebar
│   ├── hooks/
│   │   └── useWebSocket.js   # WebSocket connection hook
│   ├── styles/
│   │   ├── index.css         # Global styles & theme
│   │   └── App.css           # Component styles
│   ├── App.jsx               # Root component
│   └── main.jsx              # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## WebSocket Protocol

The frontend expects the backend WebSocket at `ws://localhost:8000/ws/chat/{thread_id}`

### Incoming Messages (from backend)

```json
{"type": "start"}
{"type": "token", "content": "Hello"}
{"type": "token", "content": " world"}
{"type": "end"}
{"type": "error", "message": "Something went wrong"}
```

### Outgoing Messages (to backend)

```json
{"type": "message", "content": "User's message here"}
```

## Theme Customization

Edit `src/styles/index.css` to customize colors:

```css
:root {
  --bg-primary: #0a0a0f;        /* Main background */
  --accent-gold: #fbbf24;       /* Primary accent */
  --accent-purple: #8b5cf6;     /* Secondary accent */
  --accent-cyan: #22d3ee;       /* Tertiary accent */
  --text-primary: #f3f4f6;      /* Primary text */
}
```

## Future Features

The following components are prepared for future backend integration:

- **Reasoning Panel**: Multi-tab view for planning, tools, and agents
- **Tool Execution**: Visualize tool calls and results
- **Multi-Agent View**: Watch agent orchestration in real-time
- **File Attachments**: Drag-and-drop file upload support

## Browser Support

- Chrome/Edge 90+
- Firefox 90+
- Safari 15+

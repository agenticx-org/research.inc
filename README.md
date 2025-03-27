# Websocket Chat Application

This project demonstrates a real-time chat application with streaming responses using WebSockets. It consists of:

- A Next.js frontend with TypeScript, React, and Tailwind CSS
- A FastAPI backend that simulates streaming LLM responses

## Project Structure

```
.
├── backend/           # Python FastAPI WebSocket server
│   ├── app/           # Application code
│   └── requirements.txt # Python dependencies
├── src/               # Frontend Next.js application
└── ...
```

## Setup and Running

### Backend (Python/FastAPI)

1. Create a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the server:
   ```bash
   python run.py
   ```

The backend will be available at `http://localhost:8000` with WebSocket connections at `ws://localhost:8000/ws/chat`.

### Frontend (Next.js)

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run the development server:
   ```bash
   pnpm dev
   ```

The frontend will be available at `http://localhost:3000`.

## Features

- Real-time chat interface
- Streaming responses via WebSockets
- Support for different LLM models
- Agent and Chat modes
- Simulated responses with different content types (text, code, rich elements)

## Development

- The `.env.local` file configures the WebSocket connection URL
- Backend simulates different response types based on the query
- WebSocket connections are managed in the `useWebSocket` hook

## Database

If you are working on a databae for the first time, you will need to export the schema and push to that database. 
Otherwise you will get errors such as table not found X

Run the following commands to do this:

npx prisma generate
source ./export_env_simple.sh
npx prisma migrate dev --name init


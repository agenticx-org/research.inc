# Research.inc Backend

This is the Python backend for the Research.inc application. It handles real-time communication with the frontend through WebSockets and manages documents, chats, and blocks.

## Features

- WebSocket-based real-time communication
- Event-based architecture for handling chat and document interactions
- Prisma ORM integration for database operations
- Streaming LLM responses with Claude API

## Setup

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

3. Set up environment variables in `.env` file:

```
DATABASE_URL="postgresql://username:password@localhost:5432/research_inc"
ANTHROPIC_API_KEY="your_anthropic_api_key"
```

4. Generate Prisma client:

```bash
prisma generate
```

5. Run database migrations:

```bash
prisma migrate dev
```

## Running the Server

To start the development server:

```bash
python run.py
```

The server will be available at http://localhost:8000.

## API Endpoints

### WebSocket

- `/ws` - Main WebSocket endpoint for real-time communication

### REST API

- `GET /api/documents/{document_id}` - Get document by ID with blocks
- `GET /api/chats/{chat_id}` - Get chat by ID with messages
- `POST /api/documents` - Create a new document
- `POST /api/chats` - Create a new chat
- `POST /api/blocks/{block_id}/accept` - Accept new content for a block
- `POST /api/blocks/{block_id}/reject` - Reject new content for a block

## Event Format

Events sent to the WebSocket should have the following format:

```json
{
  "name": "chat_message",
  "message": {
    "content": "What is the capital of France?",
    "role": "user"
  },
  "model": "claude-3-5-sonnet-20240620",
  "mode": "chat",
  "block_id": "optional-block-id",
  "document_id": "optional-document-id",
  "chat_id": "optional-chat-id",
  "user_id": "required-user-id"
}
```

## Response Format

Responses from the WebSocket will have the following format:

```json
{
  "type": "md",
  "block_ids": "block-id",
  "document_id": "optional-document-id",
  "content": "Streamed content chunk",
  "end": false,
  "new_doc": false
}
```

## Architecture

The backend is structured around these key components:

1. **FastAPI Application** - Handles HTTP requests and WebSocket connections
2. **Agent Processor** - Processes events and manages LLM interactions
3. **Database Interface** - Provides methods to interact with the Prisma ORM
4. **Domain Models** - Represents the data structure of the application 
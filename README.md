# Web UI Chatbot Backend & Logic

This repository powers the AI assistant accessible through the native Web User Interface. The backend uses FastAPI, Supabase for context memory, and Groq for LLM generation.

## How it Works

The application handles HTTP requests directly to its API routes. For web requests, it exposes a `POST /api/web-chat` endpoint. (It also retains the `/webhook` endpoint for Telegram backwards compatibility if needed, though primarily intended for the Web UI).

## Memory Context & Turn Limits

Memory and conversational context are maintained via **Supabase**. 

1. **Session Identifiers**:
   - For **Web UI**: Context is grouped by a dynamically generated `sessionId` (e.g. `session_abcdef123`). This acts as the `chat_id` parameter to isolate conversations between different browser tabs or sessions.

2. **Context Window (Turns)**:
   - To keep prompt sizes manageable and reduce token usage (and latency), the bot fetches the last **10 messages** (5 turns) from the Supabase `chat_history` table.
   - The messages are ordered chronologically and appended to the prompt sent to Groq. 
   - This means the LLM can "remember" the immediate past of the conversation up to exactly 10 past message exchanges before it starts forgetting older parts of the conversation.

3. **User Identification**:
   - The system prompt allows for specific behavior based on usernames (e.g. `alv_rrr`, `elizabethapr`).
   - In the Web UI, the user can change their `Username` which gets sent to the API and alters the behavior according to the `SYSTEM_PROMPT`.

## Logging

Every interaction, whether it succeeds via the primary LLM (Qwen) or falls back to the secondary LLM (Llama 3.3), is logged into Google Sheets. The logs record the `chat_id` (which can be a Telegram ID or a web session ID), the username, request time, and the user's message along with the bot's response.

## Running the Project

```bash
uvicorn api.index:app --reload
```
Once started, you can access the Web UI by visiting `http://localhost:8000/`.

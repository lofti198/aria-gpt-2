# Basic Template - Application Overview

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS, Radix UI, Lucide icons |
| AI/LLM | LangGraph ReAct agent, LangChain.js, OpenAI GPT-4 |
| Streaming | Vercel AI SDK (`ai` package) |
| Auth | Auth0 (`@auth0/nextjs-auth0` v4) |
| Notifications | Sonner (toast) |

## Project Structure

```
├── library/
│   └── auth0.ts              # Auth0 client instance
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts  # POST endpoint — LangGraph agent
│   │   ├── layout.tsx         # Root layout (session, header, logout)
│   │   ├── page.tsx           # Homepage (login gate + chat window)
│   │   └── globals.css
│   ├── components/
│   │   ├── ChatWindow.tsx     # Client-side chat UI (useChat hook)
│   │   ├── ChatMessageBubble.tsx  # Individual message bubble
│   │   ├── Navbar.tsx         # Navigation with active links
│   │   ├── guide/GuideInfoBox.tsx
│   │   └── ui/               # Reusable UI primitives (button, input, dialog…)
│   ├── middleware.ts          # Auth0 middleware (route protection)
│   └── utils/
│       ├── cn.ts              # Tailwind class merge helper
│       ├── message-converters.ts  # Vercel AI ↔ LangChain message conversion
│       └── stream-logging.ts     # Dev-mode tool call logging
├── .env                       # Environment variables (API keys, Auth0 config)
├── next.config.js             # Next.js config (bundle analyzer)
└── package.json
```

## Application Flow

```
User → Auth0 login → Homepage → ChatWindow → POST /api/chat → LangGraph agent (GPT-4) → streamed response
```

1. **Authentication**: Middleware intercepts every request. If no active Auth0 session, the user is redirected to `/auth/login`. Auth routes (`/auth/login`, `/auth/logout`, `/auth/callback`) are handled automatically by the Auth0 SDK.

2. **Layout** (`layout.tsx`): Fetches the session server-side. Displays the logged-in user's name and a logout button in the header.

3. **Homepage** (`page.tsx`): Checks for a session. If unauthenticated, shows "Log in" / "Sign up" buttons. If authenticated, renders the `ChatWindow`.

4. **Chat UI** (`ChatWindow.tsx`): Client component using Vercel AI SDK's `useChat` hook. Sends messages to `/api/chat`, receives streamed tokens, and renders them in `ChatMessageBubble` components. Auto-scrolls to bottom via `use-stick-to-bottom`.

5. **Chat API** (`api/chat/route.ts`): Creates a LangGraph ReAct agent with GPT-4 (temperature 0). Currently has no tools attached — the agent answers from its training data only. Streams events back using `LangChainAdapter`.

## Key Environment Variables

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | OpenAI API access for GPT-4 |
| `AUTH0_DOMAIN` | Auth0 tenant domain |
| `AUTH0_CLIENT_ID` | Auth0 application client ID |
| `AUTH0_CLIENT_SECRET` | Auth0 application client secret |
| `AUTH0_SECRET` | Encryption key for session cookies (min 32 bytes) |
| `APP_BASE_URL` | Application base URL (`http://localhost:3000`) |

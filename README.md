# CodeSync

Real-time collaborative code editor. Multiple people can join a room, write code together, see each other's cursors, chat, and run code right in the browser.

## Features

- Live code collaboration with real-time sync
- Cursor presence — see where others are typing
- In-room chat
- Code execution (supports 17+ languages)
- Save and load code snapshots
- Password-protected rooms
- JWT authentication

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Monaco Editor, Socket.IO Client, TailwindCSS
- **Backend:** Node.js, Express, Socket.IO, MongoDB, Mongoose, JWT, Zod

## Setup

**Prerequisites:** Node.js 18+, MongoDB, npm

```bash
# Clone and install
git clone <repo-url>
cd Code-Editor

# Backend
cd backend
npm install
# Create .env with MONGO_URI, JWT_SECRET, PORT, CORS_ORIGIN
npm run dev

# Frontend
cd ../frontend
npm install
npm run dev
```

Open `http://localhost:5173`



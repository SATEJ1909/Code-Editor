# CodeSync - Collaborative Code Editor

A production-ready real-time collaborative code editor built with React, Monaco Editor, Socket.IO, and MongoDB.

![CodeSync](https://img.shields.io/badge/CodeSync-Collaborative%20Editor-6366f1)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **Real-time Collaboration** - Multiple users can edit the same code simultaneously
- **Live Cursor Presence** - See other users' cursor positions with colored indicators
- **Built-in Chat** - Communicate with team members in-room
- **Room-based Sessions** - Create or join rooms with unique IDs
- **Language Support** - 17+ programming languages with syntax highlighting
- **Save & Load** - Persist code snapshots for later access
- **JWT Authentication** - Secure user registration and login
- **Responsive Design** - Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- React 19 + TypeScript
- Vite (build tool)
- Monaco Editor
- Socket.IO Client
- TailwindCSS 4

### Backend
- Node.js + Express
- Socket.IO
- MongoDB + Mongoose
- JWT Authentication
- Zod Validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repo-url>
cd Code-Editor
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create `.env` file (or use the existing one):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/collab-code-editor
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

Start the backend:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the Application
Navigate to `http://localhost:5173` in your browser.

## 📁 Project Structure

```
Code-Editor/
├── backend/
│   ├── src/
│   │   ├── config/         # Environment configuration
│   │   ├── controller/     # Route handlers
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── types/          # TypeScript types
│   │   ├── socket.ts       # Socket.IO events
│   │   └── index.ts        # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── App.tsx         # Main app component
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/user/register` | Register new user |
| POST | `/api/v1/user/login` | Login user |
| GET | `/api/v1/user/me` | Get current user |

### Rooms
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/room` | Create room |
| GET | `/api/v1/room` | List user rooms |
| GET | `/api/v1/room/:roomId` | Get room details |
| POST | `/api/v1/room/:roomId/join` | Join room |
| PATCH | `/api/v1/room/:roomId` | Update room |

### Snippets
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/snippet/save` | Save code snapshot |
| GET | `/api/v1/snippet/:roomId` | Get latest code |
| GET | `/api/v1/snippet/:roomId/history` | Get history |

## 🔧 Socket Events

### Client → Server
| Event | Description |
|-------|-------------|
| `join-room` | Join a collaborative room |
| `leave-room` | Leave current room |
| `code-change` | Broadcast code changes |
| `cursor-move` | Broadcast cursor position |
| `language-change` | Change language |
| `chat-message` | Send chat message |

### Server → Client
| Event | Description |
|-------|-------------|
| `room-users` | List of users in room |
| `user-joined` | User joined notification |
| `user-left` | User left notification |
| `code-update` | Receive code changes |
| `cursor-update` | Receive cursor updates |
| `chat-receive` | Receive chat message |

## 🎨 Supported Languages

JavaScript, TypeScript, Python, Java, C++, C, C#, Go, Rust, Ruby, PHP, HTML, CSS, JSON, Markdown, SQL, Plain Text

## 🔐 Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- CORS configured for production
- Input validation with Zod

## 🚢 Deployment

### Environment Variables (Production)

**Backend:**
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=<strong-random-secret>
CORS_ORIGIN=https://your-frontend-domain.com
```

**Frontend:**
```env
VITE_API_URL=https://your-api-domain.com/api/v1
VITE_SOCKET_URL=https://your-api-domain.com
```

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

Built with ❤️ using React, Monaco Editor, and Socket.IO

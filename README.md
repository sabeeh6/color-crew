# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


<!-- 
Backend Integration Summary 🔗
1. API Management Setup
Your project uses Redux Toolkit Query (RTK Query) for backend communication:

API Files Location:
authApi.js - Authentication API
sketchApi.js - Sketch/Drawing API
Store Configuration:
index.js - Redux store with both API reducers and middleware
2. Authentication APIs (authApi.js)
Base URL: {VITE_API_URL}/api

Endpoints:

POST /auth/login - User login (with email, password)
POST /auth/register - User registration (with name, email, password)
GET /auth/me - Get current user info
Automatically stores JWT token in Redux auth state after login/register.

3. Sketch/Drawing APIs (sketchApi.js)
Base URL: {VITE_API_URL}/api

Endpoints:

GET /sketches?page=X&limit=Y - Get all user sketches (paginated)
GET /sketches/:id - Get single sketch with full Fabric JSON
POST /sketches - Create or update sketch
DELETE /sketches/:id - Delete sketch
PATCH /sketches/:id/title - Rename sketch
Features:

✅ Automatic JWT authentication (Bearer {token})
✅ Cache tags for auto-invalidation
✅ Auto-refetch sketch list after save/delete
4. How APIs Are Used
In Components via Hooks:

5. Environment Configuration ⚙️
Backend URL is set via VITE_API_URL environment variable (not found in your repo, so you need to create .env file):

6. Additional Tech 📦
Socket.io imported but socketService.js is empty (not yet implemented)
Authentication hooks in useAuth.js
Protected routes in ProtectedRoute.jsx
Quick Summary:
✅ Where: API calls are in api directory
✅ How: RTK Query with Redux state management
✅ Auth: JWT token-based (automatic via middleware)
✅ Missing: .env file with backend URL

Kya aur kuch details chahiye? 😊
 -->



<!-- Set up for Socket.io Communication -->
# Collaborative Sketching App (Fabric.js + Socket.io Plan)

Yeh plan aapke existing **Fabric.js** project (`DrawingPage.jsx` waghera) ke andar multiplayer collaboration aur sharing ka feature add karne ke liye hai.

---

## 🛠️ Step-by-Step Implementation Guide

### 1. Backend Setup (Socket.io)
Aapke `Backend/server.js` aur naye file `Backend/socket/index.js` mein hum socket.io setup karenge.

```javascript
// Backend/socket/index.js
export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    socket.on("join-room", (roomId, callback) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      // Limit to 5 users
      if (room && room.size >= 5) {
        if (callback) callback({ success: false, message: "Room is full" });
        return;
      }
      socket.join(roomId);
      if (callback) callback({ success: true });
    });

    // Fabric JSON data broadcast karna
    socket.on("canvas-update", (data) => {
      socket.to(data.roomId).emit("on-canvas-update", data.fabricJSON);
    });
  });
};
```

---

### 2. Share Modal Component (Google Docs / Figma Style)
Yeh modal `src/components/modals/ShareModal.jsx` mein banega.

```jsx
// src/components/modals/ShareModal.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, X } from 'lucide-react';

export default function ShareModal({ onClose }) {
  const [copied, setCopied] = useState(false);
  const currentUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // 2 second baad wapis Copy icon
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
      >
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white">
          <X size={20} />
        </button>

        <h2 className="text-white font-bold text-xl mb-2">Share this Sketch</h2>
        <p className="text-neutral-400 text-sm mb-6">
          Anyone with this link can join and collaborate in real-time. (Max 5 users allowed)
        </p>

        <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-700 p-2 rounded-xl">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="flex-1 bg-transparent text-neutral-300 text-sm outline-none px-2"
          />
          <button
            onClick={handleCopy}
            className={`flex items-center justify-center w-24 py-2 rounded-lg text-sm font-medium transition-colors ${
              copied ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-violet-600 hover:bg-violet-500 text-white'
            }`}
          >
            {copied ? <><Check size={16} className="mr-1" /> Copied</> : <><Copy size={16} className="mr-1" /> Copy</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
```

Is modal ko `CanvasToolbar.jsx` mein "Share" button ke click par open kiya jayega.

---

### 3. Room Full Error UI (Professional Response)
Agar 6th user join karne ki koshish kare, toh usay canvas nahi dikhayenge. Balke `DrawingPage.jsx` mein yeh component show karenge.

```jsx
// src/components/ui/RoomFullError.jsx
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';

export default function RoomFullError() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-neutral-950 text-center px-4">
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl max-w-md shadow-2xl flex flex-col items-center">
        <div className="bg-red-500/20 p-4 rounded-full mb-6">
          <Users size={40} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Room is Full</h1>
        <p className="text-neutral-400 mb-8 leading-relaxed">
          This collaborative sketch space has reached its maximum capacity of 5 users. Please try again later or create a new sketch.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl font-medium transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
```

---

### 4. Integration in `DrawingPage.jsx`
Jab page load hoga, socket connect kare ga. Agar backend se error aaya "Room is full", toh state update ho jayegi aur hum error screen show karenge.

```jsx
// Inside DrawingPage.jsx

import { socket } from '../utils/socket';
import RoomFullError from '../components/ui/RoomFullError';

const DrawingPage = () => {
  // ... existing code ...
  const [isRoomFull, setIsRoomFull] = useState(false);

  useEffect(() => {
    if (sketchId) {
      // Jab URL mein ID ho toh room join karo
      socket.emit("join-room", sketchId, (response) => {
        if (!response.success && response.message === "Room is full") {
          setIsRoomFull(true);
        }
      });
    }
  }, [sketchId]);

  // Agar room full hai toh aagay canvas render mat karo!
  if (isRoomFull) {
    return <RoomFullError />;
  }

  return (
    // ... aapka existing Canvas aur Panels ka code ...
  );
}
```

---

## 🚦 User Review Required

> [!IMPORTANT]  
> Maine Share Modal aur Room Full dono ka professional code Implementation Plan mein shamil kar diya hai. 
> 
> Agar yeh approach aapko theek lag rahi hai toh kindly approve karein ta ke main code ko files mein likhna start karun!


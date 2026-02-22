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
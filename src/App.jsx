// import './App.css'
// import {Routes , Route , Navigate} from "react-router-dom"
// import { SignIn } from './components/signIn'
// import { SignUp } from './components/signUp'

// function App() {

//   return (
//     <>
//     <Routes>
//       <Route path="/" element={<Navigate to="/sign-in" />} />
//       <Route path='/sign-up' element={<SignUp/>}/>
//       <Route path='/sign-in' element={<SignIn/>}/>
//     </Routes>
//     </>
//   )
// }

// export default App
import { lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

// Layout Components
import ProtectedRoute from './components/layout/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Spinner from './components/ui/Spinner';

// ─── Lazy-loaded Pages (Performance: DrawingPage is heavy due to Fabric.js) ──
const LandingPage    = lazy(() => import('./pages/LandingPage'));
const LoginPage      = lazy(() => import('./pages/LoginPage'));
const RegisterPage   = lazy(() => import('./pages/RegisterPage'));
const DashboardPage  = lazy(() => import('./pages/DashboardPage'));
const DrawingPage    = lazy(() => import('./pages/DrawingPage'));

// ─── Page-level loading fallback ─────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center w-full h-screen bg-neutral-950">
    <Spinner size="lg" />
  </div>
);

// ─── Routes that show the Navbar ─────────────────────────────────────────────
const WithNavbar = ({ children }) => (
  <>
    <Navbar />
    <main className="pt-16">{children}</main>
  </>
);

// ─── App Root ─────────────────────────────────────────────────────────────────
const App = () => {
  return (
    <Router>

      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e1e2e',
            color: '#cdd6f4',
            border: '1px solid #313244',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#a6e3a1', secondary: '#1e1e2e' } },
          error:   { iconTheme: { primary: '#f38ba8', secondary: '#1e1e2e' } },
        }}
      />

      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* ── Public Routes ──────────────────────────────────────────── */}
            <Route
              path="/"
              element={
                <WithNavbar>
                  <LandingPage />
                </WithNavbar>
              }
            />

            <Route
              path="/login"
              element={
                <WithNavbar>
                  <LoginPage />
                </WithNavbar>
              }
            />

            <Route
              path="/register"
              element={
                <WithNavbar>
                  <RegisterPage />
                </WithNavbar>
              }
            />

            {/* ── Protected Routes (require authentication) ──────────────── */}
            <Route element={<ProtectedRoute />}>

              {/* Dashboard — sketch gallery */}
              <Route
                path="/dashboard"
                element={
                  <WithNavbar>
                    <DashboardPage />
                  </WithNavbar>
                }
              />

              {/* Drawing canvas — NO navbar (full-screen editor) */}
              {/* New blank sketch */}
              <Route
                path="/draw"
                element={<DrawingPage />}
              />

              {/* Open existing sketch by ID */}
              <Route
                path="/draw/:sketchId"
                element={<DrawingPage />}
              />

            </Route>

            {/* ── 404 Fallback ────────────────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Suspense>
      </AnimatePresence>

    </Router>
  );
};

export default App;


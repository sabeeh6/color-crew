import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Palette, LayoutDashboard, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, isAuthenticated, logoutUser } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 h-16
                 bg-neutral-900/80 backdrop-blur-md
                 border-b border-neutral-800
                 flex items-center justify-between px-6"
    >
      {/* ── Brand ──────────────────────────────────────────────────────── */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center
                        group-hover:bg-violet-500 transition-colors">
          <Palette size={16} className="text-white" />
        </div>
        <span className="font-bold text-lg text-white tracking-tight">
          Color<span className="text-violet-400">Crew</span>
        </span>
      </Link>

      {/* ── Nav Links ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                          font-medium transition-colors
                          ${isActive('/dashboard')
                            ? 'bg-violet-600 text-white'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                          }`}
            >
              <LayoutDashboard size={15} />
              Dashboard
            </Link>

            <Link
              to="/draw"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                         font-medium bg-violet-600 hover:bg-violet-500
                         text-white transition-colors"
            >
              <Palette size={15} />
              New Sketch
            </Link>

            {/* ── User avatar + logout ───────────────────────────────── */}
            <div className="flex items-center gap-3 ml-2 pl-4
                            border-l border-neutral-700">
              <div className="w-8 h-8 rounded-full bg-violet-800
                              flex items-center justify-center text-sm
                              font-semibold text-white select-none">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                className="text-neutral-500 hover:text-red-400 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                          font-medium transition-colors
                          ${isActive('/login')
                            ? 'bg-violet-600 text-white'
                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                          }`}
            >
              <LogIn size={15} />
              Login
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                         font-medium bg-violet-600 hover:bg-violet-500
                         text-white transition-colors"
            >
              <UserPlus size={15} />
              Sign Up
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Palette, User, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const RegisterPage = () => {
  const navigate  = useNavigate();
  const { register, registerLoading, isAuthenticated } = useAuth();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    try {
      await register(name, email, password);
    } catch (err) {
      setError(err?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center
                    justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="bg-neutral-900 border border-neutral-800
                        rounded-2xl p-8 shadow-2xl">

          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-violet-600 rounded-2xl
                            flex items-center justify-center mb-4">
              <Palette size={22} className="text-white" />
            </div>
            <h1 className="text-white text-2xl font-bold">Create account</h1>
            <p className="text-neutral-500 text-sm mt-1">
              Start drawing on Color Crew — free forever
            </p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800/50
                            rounded-xl px-4 py-3 mb-5 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-neutral-400 text-xs font-medium uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-neutral-800 text-white text-sm rounded-xl
                             pl-10 pr-4 py-3 border border-neutral-700
                             focus:outline-none focus:border-violet-500
                             placeholder:text-neutral-600 transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-neutral-400 text-xs font-medium uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-neutral-800 text-white text-sm rounded-xl
                             pl-10 pr-4 py-3 border border-neutral-700
                             focus:outline-none focus:border-violet-500
                             placeholder:text-neutral-600 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-neutral-400 text-xs font-medium uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full bg-neutral-800 text-white text-sm rounded-xl
                             pl-10 pr-10 py-3 border border-neutral-700
                             focus:outline-none focus:border-violet-500
                             placeholder:text-neutral-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2
                             text-neutral-600 hover:text-neutral-400 transition-colors"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={registerLoading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60
                         disabled:cursor-not-allowed text-white font-semibold
                         rounded-xl py-3 mt-2 transition-colors flex items-center
                         justify-center gap-2"
            >
              {registerLoading && <Loader2 size={16} className="animate-spin" />}
              {registerLoading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-neutral-600 text-sm mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

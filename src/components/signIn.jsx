import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import pic2 from "../assets/pic2.jpg";
import { useNavigate } from 'react-router-dom';

export const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    console.log('Form Data:', data); // { email: '...', password: '...' }
    // API call here
    // await loginUser(data.email, data.password);
    // navigate('/dashboard');
  };

  return (
    <>
      <div className="min-h-screen relative w-full flex items-center justify-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${pic2})` }}
        />

        {/* Content */}
        <div className="relative z-10 w-full max-w-md px-6 py-12 animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-8 animate-slide-down">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4 transform hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-Black mb-2">Welcome Back</h2>
            <p className="text-Black-300 text-sm">Sign in to continue your journey</p>
          </div>

          {/* ✅ handleSubmit wraps your onSubmit */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-slide-up">

            {/* Email Field */}
            <div className="transform hover:scale-[1.02] transition-transform duration-200">
              <label htmlFor="signin-email" className="block text-sm font-medium text-black-200 mb-2">
                Email address
              </label>
              <div className="relative">
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="block w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-indigo-800 placeholder-indigo-400 shadow-sm focus:shadow-lg focus:shadow-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  // ✅ register replaces value + onChange + useState
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
              </div>
              {/* ✅ Automatic error message */}
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="transform hover:scale-[1.02] transition-transform duration-200">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="signin-password" className="block text-sm font-medium text-black-200">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="block w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-indigo-800 placeholder-indigo-400 shadow-sm focus:shadow-lg focus:shadow-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  // ✅ register with validation rules
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                {/* Eye Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-indigo-400 hover:text-indigo-300 focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* ✅ Automatic error message */}
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-indigo-500/50 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {/* ✅ isSubmitting automatically tracks loading state */}
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-gray-300 animate-fade-in">
            Don't have an account?{'  '}
            
            <a  href="#"
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
              onClick={() => navigate('/sign-up')}
            >
              Create Your Account
            </a>
          </p>
        </div>
      

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 1s ease-out; }
        .animate-slide-down { animation: slide-down 0.8s ease-out; }
        .animate-slide-up { animation: slide-up 0.8s ease-out 0.2s both; }
      `}</style>
    </div>
    </>
  );
};
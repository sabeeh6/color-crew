import React, { useState } from 'react';
import pic2 from "../assets/pic2.jpg"
// import pic4 from "../assets/pic4.jpg"

export const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', { email, password });
  };

  return (
    <>
     {/* <div className="flex min-h-screen m-20 border rounded-4xl p-10"> */}
      {/* Left Side - Sign In Form with Background */}
      <div className="min-h-screen relative w-full flex items-center justify-center  ">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${pic2})`,
          }}
        />
         {/* <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20"></div> */}

        {/* Content */}
        <div className="relative z-10 w-full max-w-md px-6  animate-fade-in  ">
          {/* Logo */}
          <div className="text-center  animate-slide-down">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4 transform hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold  mb-2">
              Welcome Back
            </h2>
            <p className="-300 text-sm">
              Sign Up to continue your journey
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5 animate-slide-up">
             {/* Email Name */}
            <div className="transform hover:scale-[1.02] transition-transform duration-200">
              <label htmlFor="name" className="block text-sm font-medium -200 ">
                Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-indigo-800 placeholder-indigo-400 shadow-sm focus:shadow-lg focus:shadow-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  placeholder="Mota Bhai"
                />
              </div>
            </div>
            {/* Email Field */}
            <div className="transform hover:scale-[1.02] transition-transform duration-200">
              <label htmlFor="email" className="block text-sm font-medium -200 ">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-indigo-800 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  placeholder="you@example.com"
                />
              </div>
            </div>

              {/* Password Field */}
            <div className="transform hover:scale-[1.02] transition-transform duration-200">
              <div className="flex items-center justify-between ">
                <label htmlFor="password" className="block text-sm font-medium ">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-indigo-500 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  placeholder="••••••••"
                />
              </div>
            </div>

 {/* Age Field */}
            <div className="transform hover:scale-[1.02] transition-transform duration-200">
              <label htmlFor="age" className="block text-sm font-medium -200 ">
                Age
              </label>
              <div className="relative">
                <input
                  id="age"
                  name="age"
                  type="number"
                  required
                  autoComplete="age"
                  // value={age}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-indigo-800 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  placeholder="Type your Age"
                />
              </div>
            </div>

             {/* experince Field */}
            <div className="transform hover:scale-[1.02] transition-transform duration-200">
              <label htmlFor="experince" className="block text-sm font-medium -200 ">
                Experince
              </label>
              <div className="relative">
                <input
                  id="experince"
                  name="experince"
                  type="number"
                  required
                  autoComplete="experince"
                  // value={experince}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-indigo-800 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  placeholder="Type your Experince"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-indigo-500/50 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              Sign Up
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-gray-300 animate-fade-in">
            Don't have an account?{' '}
            <a
              href="#"
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
            >
              Start free trial
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-down {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scale-in {
          from { 
            transform: scale(1.1);
          }
          to { 
            transform: scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.3s both;
        }
        
        .animate-slide-down {
          animation: slide-down 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.2s both;
        }
        
        .animate-scale-in {
          animation: scale-in 20s ease-out infinite alternate;
        }
      `}</style>
     {/* </div> */}
    </>
  );
};
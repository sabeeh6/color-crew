import React, { useState } from 'react';
import pic2 from "../assets/pic2.jpg"
import { useNavigate } from 'react-router-dom';
// import pic4 from "../assets/pic4.jpg"

export const SignUp = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  // const [age, setAge] = useState('');
  const [experince, setExperince] = useState('');
  const [showPassword , setShowPassword]= useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', { email,name, password , experince });
  };
  const passwordVisibility = ()=>{
    setShowPassword(!showPassword )
  }

  const redirectToSignIn=()=>{
    navigate('/sign-in')
  }

  return (
    <>
      {/* Left Side - Sign In Form with Background */}
      <div className="min-h-screen relative w-full flex items-center justify-center  ">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${pic2})`,
          }}
        />

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
              <label htmlFor="name" className="block text-sm font-medium -200 mb-2">
                Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-indigo-800 placeholder-indigo-400 shadow-sm focus:shadow-lg focus:shadow-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  placeholder="Mota Bhai"
                />
              </div>
            </div>
            {/* Email Field */}
            <div className="transform hover:scale-[1.02] transition-transform duration-200">
              <label htmlFor="email" className="block text-sm font-medium -200 mb-2">
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
                  className="block w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-indigo-800 placeholder-indigo-400 shadow-sm focus:shadow-lg focus:shadow-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  placeholder="you@example.com"
                />
              </div>
            </div>

              {/* Password Field */}
            <div className="transform hover:scale-[1.02] transition-transform duration-200">
              <div className="flex items-center justify-between ">
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword? 'text' : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-indigo-800 placeholder-indigo-400 shadow-sm focus:shadow-lg focus:shadow-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={passwordVisibility}
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
            </div>

 {/* Age Field */}
            {/* <div className="transform hover:scale-[1.02] transition-transform duration-200">
              <label htmlFor="age" className="block text-sm font-medium -200 mb-2">
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
                  onChange={(e) => setAge(e.target.value)}
                  className="block w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-indigo-800 placeholder-indigo-400 shadow-sm focus:shadow-lg focus:shadow-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  placeholder="Type your Age"
                />
              </div>
            </div> */}

             {/* experince Field */}
            <div className="transform hover:scale-[1.02] transition-transform duration-200">
              <label htmlFor="experince" className="block text-sm font-medium -200 mb-2">
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
                  onChange={(e) => setExperince(e.target.value)}
                  className="block w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-indigo-800 placeholder-indigo-400 shadow-sm focus:shadow-lg focus:shadow-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
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
          <p className="mt-8 text-center text-sm text-gray-400 animate-fade-in">
            Already have an account?{"   "}
            <a
              href="#"
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
              onClick={redirectToSignIn}
            >
              Login with your Account
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
    </>
  );
};
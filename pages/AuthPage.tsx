
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Alert from '../components/Alert';

const AuthPage: React.FC = () => {
  const { login, signup, isAuthenticated } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/profile" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
        setError("Email and password are required.");
        return;
    }
    if (!email.includes('@')) {
        setError("Please enter a valid email address.");
        return;
    }

    if (!isLoginView && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }

    try {
      if (isLoginView) {
        // Mock login: In a real app, this would call an API
        login(email, 'mock_auth_token'); // Simulate successful login
      } else {
        // Mock signup
        signup(email, 'mock_auth_token'); // Simulate successful signup
      }
      // Navigation to /profile will happen automatically due to AuthContext update
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    }
  };
  
  const handleSocialLogin = (provider: 'Google' | 'LinkedIn') => {
    // Mock social login
    console.log(`Attempting ${provider} login...`);
    setError(null);
    // In a real app, this would initiate OAuth flow.
    // For mock, simulate successful login after a delay.
    setTimeout(() => {
        login(`${provider.toLowerCase()}user@example.com`, 'mock_social_token');
    }, 1000);
  };


  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-sky-300">
            {isLoginView ? 'Sign in to your account' : 'Create your account'}
          </h2>
        </div>
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-600 bg-slate-700 text-gray-200 placeholder-gray-400 rounded-t-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLoginView ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-600 bg-slate-700 text-gray-200 placeholder-gray-400 ${!isLoginView ? '' : 'rounded-b-md'} focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
              />
            </div>
            {!isLoginView && (
              <div>
                <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-600 bg-slate-700 text-gray-200 placeholder-gray-400 rounded-b-md focus:outline-none focus:ring-sky-500 focus:border-sky-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500"
            >
              {isLoginView ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </form>

        <div className="mt-6">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-800 text-gray-400">Or continue with</span>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
                <div>
                    <button onClick={() => handleSocialLogin('Google')} className="w-full inline-flex justify-center py-3 px-4 border border-slate-600 rounded-md shadow-sm bg-slate-700 text-sm font-medium text-gray-300 hover:bg-slate-600 transition-colors">
                        <span className="sr-only">Sign in with Google</span>
                        {/* Basic Google Icon (SVG or text) */}
                        <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.7 512 244 512 110.3 512 0 401.7 0 265.2 0 128.5 109.1 17.6 244 17.6c78.2 0 140.8 30.9 186.4 74.3l-67.3 64.4C335.9 129.6 293.6 96 244 96c-70.9 0-128.4 57.5-128.4 128.3s57.5 128.3 128.4 128.3c80.4 0 110.2-35.8 114.4-65.4H244V244.8h139.5c6.8 38.1 10.4 70.8 10.4 102.9z"></path></svg>
                        Google
                    </button>
                </div>
                <div>
                    <button onClick={() => handleSocialLogin('LinkedIn')} className="w-full inline-flex justify-center py-3 px-4 border border-slate-600 rounded-md shadow-sm bg-slate-700 text-sm font-medium text-gray-300 hover:bg-slate-600 transition-colors">
                        <span className="sr-only">Sign in with LinkedIn</span>
                         {/* Basic LinkedIn Icon (SVG or text) */}
                        <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="linkedin-in" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 53.79-54.3c29.7 0 53.79 24.7 53.79 54.3a53.79 53.79 0 0 1-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"></path></svg>
                        LinkedIn
                    </button>
                </div>
            </div>
        </div>

        <div className="text-sm text-center">
          <button
            onClick={() => { setIsLoginView(!isLoginView); setError(null); }}
            className="font-medium text-sky-400 hover:text-sky-300"
          >
            {isLoginView ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

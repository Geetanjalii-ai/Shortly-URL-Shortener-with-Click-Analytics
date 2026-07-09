import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { X, Lock, Mail, User, ShieldAlert } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialView = 'login' }) {
  const [view, setView] = useState(initialView); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === 'login') {
        const result = await login(username, password);
        if (result.success) {
          showToast('Welcome back to Shortly!', 'success');
          onClose();
        } else {
          showToast(result.error, 'error');
        }
      } else {
        const result = await register(username, email, password);
        if (result.success) {
          showToast('Account created successfully!', 'success');
          onClose();
        } else {
          showToast(result.error, 'error');
        }
      }
    } catch (err) {
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-navy/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-white/10 bg-[#0e1f33]/95 p-8 shadow-2xl backdrop-blur-2xl transition-all animate-[modalScale_0.25s_ease-out]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Heading */}
        <div className="mb-6 text-center">
          <h3 className="text-2xl font-bold text-white">
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
          </h3>
          <p className="text-sm text-white/50 mt-1">
            {view === 'login' 
              ? 'Log in to access your dashboard and links' 
              : 'Sign up for shortly and unlock premium features'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username (used for login and signup) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              {view === 'login' ? 'Username or Email' : 'Username'}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={view === 'login' ? 'Enter username or email' : 'Choose a username'}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
          </div>

          {/* Email (signup only) */}
          {view === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20 text-sm"
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : view === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* View Toggle */}
        <div className="mt-6 text-center text-sm text-white/40">
          {view === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setView('signup')}
                className="text-primary hover:underline font-semibold ml-1 cursor-pointer bg-transparent border-none"
              >
                Sign Up Free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setView('login')}
                className="text-primary hover:underline font-semibold ml-1 cursor-pointer bg-transparent border-none"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalScale {
          from { transform: scale(0.95); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

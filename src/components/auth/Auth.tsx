import React, { useState } from 'react';
import { 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  Github, 
  Chrome,
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { AxiomLogo } from '../layout/AxiomLogo';
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail 
} from '../../lib/firebase';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <AxiomLogo size="lg" className="justify-center mb-6" />
          <p className="text-[#8E9299] text-[13px] font-bold uppercase tracking-[0.2em]">Your Intelligent Study Partner</p>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[40px] p-10 shadow-xl shadow-slate-100 border border-slate-50"
        >
          <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                isLogin ? "bg-white text-indigo-600 shadow-sm" : "text-[#8E9299]"
              )}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                !isLogin ? "bg-white text-indigo-600 shadow-sm" : "text-[#8E9299]"
              )}
            >
              Join axiom
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E9299] ml-4">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl py-4 pl-14 pr-5 text-sm font-bold outline-none transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8E9299] ml-4">Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl py-4 pl-14 pr-5 text-sm font-bold outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white rounded-2xl py-5 font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                  {isLogin ? 'Sign In to Axiom' : 'Create My Account'}
                </>
              )}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-3 bg-[#F9FAFB] border border-slate-100 hover:bg-slate-50 rounded-2xl py-4 text-sm font-bold text-[#141414] transition-all"
            >
              <Chrome className="w-5 h-5 text-[#4285F4]" />
              Continue with Google
            </button>
          </div>
        </motion.div>

        <p className="text-center text-[#8E9299] text-xs font-medium px-8 leading-relaxed">
          By continuing, you agree to Axiom's <span className="text-indigo-500 font-bold">Terms of Service</span> and <span className="text-indigo-500 font-bold">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}

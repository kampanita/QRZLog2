import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Terminal, Lock } from 'lucide-react';

const HASH = "b5ebb77df661ee12c02efdf5d9b639c10bfb20c44a2a0a151a0dbcf500db5498";

async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    
    setIsChecking(true);
    try {
      const h = await sha256(password);
      if (h === HASH) {
        sessionStorage.setItem('auth', 'true');
        onLogin();
      } else {
        setErrorMsg('ACCESO DENEGADO');
        setPassword('');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('ERROR DEL SISTEMA');
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#050510]">
      {/* Background Matrix/Grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050510] to-[#050510] z-0" />
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <motion.form 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md bg-black/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center"
      >
        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
          <ShieldAlert className="text-indigo-400" size={32} />
        </div>
        
        <h1 className="text-3xl font-display font-bold text-white mb-2 uppercase tracking-widest text-center italic">
          SYS<span className="text-indigo-400">LOGIN</span>
        </h1>
        <p className="text-xs font-mono text-indigo-400/70 mb-8 uppercase tracking-[0.3em] text-center flex items-center gap-2">
          <Terminal size={12} />
          Terminal Access
        </p>

        <div className="w-full space-y-6">
          <div className="space-y-2 relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/50" size={18} />
            <input
              type="password"
              placeholder="ENTER PASSCODE"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg('');
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-mono placeholder:text-muted/30 focus:outline-none focus:border-indigo-500 transition-colors text-center text-xl tracking-widest"
              autoFocus
            />
            {errorMsg && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose-500 text-xs font-mono uppercase tracking-widest text-center mt-2 font-bold animate-pulse absolute -bottom-6 w-full"
              >
                {errorMsg}
              </motion.p>
            )}
          </div>

          <button
            type="submit"
            disabled={isChecking}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-display font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] disabled:opacity-50"
          >
            {isChecking ? 'VERIFYING...' : 'INITIALIZE'}
          </button>
        </div>
        
        <div className="mt-8 text-[9px] font-mono text-muted/40 uppercase tracking-[0.4em] text-center w-full border-t border-white/5 pt-4">
          UNAUTHORIZED ACCESS STRICTLY PROHIBITED
        </div>
      </motion.form>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';
import { Mail, Lock, User, LogIn, UserPlus, Sparkles, AlertCircle } from 'lucide-react';

interface AuthViewProps {
  type: 'login' | 'signup';
  onSwitch: () => void;
  onSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ type, onSwitch, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length > 4096) {
      setError('Mopas la twò long. Li pa dwe depase 4096 karaktè.');
      return;
    }

    setLoading(true);

    try {
      if (type === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Metòd koneksyon sa a poko aktive nan Firebase. Tanpri aktive "Email/Password" nan konsol Firebase la.');
      } else {
        setError(err.message || 'Yon erè rive');
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onSuccess();
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Koneksyon Google la poko aktive nan Firebase. Tanpri aktive li nan konsol la.');
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-surface-container-low border border-outline-variant/30 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles size={120} className="text-secondary" />
        </div>

        <div className="relative z-10 text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {type === 'login' ? <LogIn className="text-primary" size={32} /> : <UserPlus className="text-primary" size={32} />}
          </div>
          <h2 className="text-2xl font-black text-primary font-headline">
            {type === 'login' ? 'Byenvini ankò' : 'Kreye kont ou'}
          </h2>
          <p className="text-sm text-outline font-medium">
            {type === 'login' ? 'Konekte pou kontinye aprann' : 'Kòmanse vwayaj ou jodi a'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-2xl flex items-center gap-3 text-xs font-bold border border-error/20">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {type === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-4">Non konplè</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-surface-container rounded-2xl border border-outline-variant focus:border-primary outline-none transition-all font-medium text-sm"
                  placeholder="Antre non ou"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-4">Imèl</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-surface-container rounded-2xl border border-outline-variant focus:border-primary outline-none transition-all font-medium text-sm"
                placeholder="egzanp@gmail.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-4">Mopas</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-surface-container rounded-2xl border border-outline-variant focus:border-primary outline-none transition-all font-medium text-sm"
                placeholder="••••••••"
                required
                maxLength={4096}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-primary text-on-primary font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              type === 'login' ? 'Konekte' : 'Enskri'
            )}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-outline-variant/30"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
              <span className="bg-surface-container-low px-2 text-outline">Oswa</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={signInWithGoogle}
            className="w-full py-4 bg-white text-black font-bold rounded-2xl border border-outline-variant hover:bg-gray-50 transition-all flex items-center justify-center gap-3 text-xs"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Konekte ak Google
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-outline-variant/30 text-center relative z-10">
          <button 
            onClick={onSwitch}
            className="text-xs font-bold text-primary hover:underline"
          >
            {type === 'login' ? 'Ou poko gen kont? Kreye youn' : 'Ou deja gen kont? Konekte'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

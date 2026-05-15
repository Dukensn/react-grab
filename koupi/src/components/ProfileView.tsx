import { 
  User, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Trophy, 
  Award, 
  BarChart3,
  ChevronRight,
  BookOpen,
  Star,
  Flame,
  Zap,
  Target,
  Medal
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserStats, View } from '../types';

interface ProfileViewProps {
  onNavigate: (view: View) => void;
  userStats: UserStats;
}

import { useAuth } from '../context/AuthContext';

export default function ProfileView({ onNavigate, userStats }: ProfileViewProps) {
  const { profile, signOut } = useAuth();
  
  const stats = [
    { label: 'Leson', value: userStats.completedLessons.length.toString(), icon: BookOpen },
    { label: 'Pwen', value: userStats.totalPoints.toString(), icon: Star },
    { label: 'Jou', value: userStats.streak.toString(), icon: Flame },
  ];

  const handleLogout = async () => {
    if (confirm('Èske ou sèten ou vle dekonekte?')) {
      await signOut();
      onNavigate('landing');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-8 max-w-md mx-auto"
    >
      {/* Header - Simple & Clean */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-20 h-20 rounded-full overflow-hidden border border-outline-variant/30 p-1">
          <img 
            src={`https://ui-avatars.com/api/?name=${profile?.displayName || 'User'}&background=f8f9fa&color=212529&size=200`}
            alt="Profile"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-medium text-primary tracking-tight">
            {profile?.displayName || 'Itilizatè'}
          </h2>
          <p className="text-[10px] font-medium text-outline uppercase tracking-[0.2em]">
            {profile?.isVIP ? 'VIP Member' : 'Standard'}
          </p>
        </div>
      </div>

      {/* Discrete Stats Bar */}
      <div className="grid grid-cols-3 gap-4 py-6 border-y border-outline-variant/20">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col items-center space-y-1">
            <span className="text-sm font-medium text-primary">{stat.value}</span>
            <span className="text-[9px] uppercase font-medium text-outline tracking-wider">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Minimalist Actions */}
      <div className="space-y-2">
        {profile?.role === 'admin' && (
          <button 
            onClick={() => onNavigate('admin')}
            className="w-full flex items-center justify-between p-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl hover:bg-surface-container transition-all"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-outline" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">Administrasyon</span>
            </div>
            <ChevronRight size={14} className="text-outline" />
          </button>
        )}

        <button 
          onClick={() => onNavigate('ai')}
          className="w-full flex items-center justify-between p-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl hover:bg-surface-container transition-all"
        >
          <div className="flex items-center gap-3">
            <Zap size={16} className="text-outline" />
            <span className="text-xs font-medium text-primary uppercase tracking-wider">Levo AI</span>
          </div>
          <ChevronRight size={14} className="text-outline" />
        </button>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl hover:bg-surface-container transition-all group"
        >
          <div className="flex items-center gap-3">
            <LogOut size={16} className="text-outline group-hover:text-error transition-colors" />
            <span className="text-xs font-medium text-primary uppercase tracking-wider group-hover:text-error transition-colors">Dekonekte</span>
          </div>
          <ChevronRight size={14} className="text-outline" />
        </button>
      </div>

      <div className="text-center">
        <p className="text-[10px] text-outline opacity-40 font-medium">Levo v1.0.4</p>
      </div>

      <div className="h-10" />
    </motion.div>
  );
}

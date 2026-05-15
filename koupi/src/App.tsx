/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  ArrowLeft, 
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings, 
  Maximize, 
  CheckSquare, 
  CheckCircle2, 
  PlayCircle, 
  Lock, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Save,
  FileText,
  Trash2,
  RotateCcw,
  RotateCw,
  Download,
  Check,
  BookOpen,
  Trophy,
  Clock,
  Layers,
  User as UserIcon,
  Home,
  Search,
  Heart,
  Send,
  MessageSquare,
  Flame,
  Bell,
  BellRing,
  X,
  Crown,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef, ChangeEvent, MouseEvent } from 'react';
import { View, Tab, Lesson, Module, Comment, UserStats, Notification } from './types';
import AdminPanel from './components/AdminPanel';
import ProfileView from './components/ProfileView';
import ResourcesView from './components/ResourcesView';
import VIPView from './components/VIPView';
import LandingPage from './components/LandingPage';
import ChatBot from './components/ChatBot';
import { FAQS } from './constants';

const INITIAL_MODULES: Module[] = [
  {
    id: 1,
    title: 'Modil 1: Fondasyon Piblisite',
    description: 'Aprann baz piblisite dijital ak fason platfòm yo travay.',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    lessons: [1, 2]
  },
  {
    id: 2,
    title: 'Modil 2: Estrateji Avanse',
    description: 'Teknik pwofesyonèl pou vize kliyan epi ogmante lavant.',
    thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800',
    lessons: [3, 4]
  },
  {
    id: 3,
    title: 'Modil 3: Optimize ak Echèl',
    description: 'Kijan pou li done ou yo epi grandi bidjè ou san pèdi lajan.',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bbbda5462875?auto=format&fit=crop&q=80&w=800',
    lessons: [5, 6]
  }
];

const INITIAL_LESSONS: Lesson[] = [
  {
    id: 1,
    moduleId: 1,
    title: 'Entwodiksyon nan Piblisite',
    duration: '15:00',
    status: 'completed',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400',
    videoUrl: 'https://dl.dropboxusercontent.com/scl/fi/ghgi5di5x5548k3zidyls/Ajoute-yon-nimewo-WhatsApp.mp4?rlkey=31gs4qe8wrbo5k7s3dpzgknq9&st=wb2ky432',
    description: 'Nan leson sa a nou pral wè istwa piblisite ak poukisa li enpòtan kounye a.',
    resources: [
      { id: 101, lessonId: 1, title: 'Gid Debitan (PDF)', url: '#', type: 'pdf' },
      { id: 102, lessonId: 1, title: 'Checklist Piblisite', url: '#', type: 'pdf' }
    ]
  },
  {
    id: 2,
    moduleId: 1,
    title: 'Kijan algorithm nan travay',
    duration: '18:45',
    status: 'completed',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bbbda5462875?auto=format&fit=crop&q=80&w=400',
    videoUrl: 'https://dl.dropboxusercontent.com/scl/fi/ghgi5di5x5548k3zidyls/Ajoute-yon-nimewo-WhatsApp.mp4?rlkey=31gs4qe8wrbo5k7s3dpzgknq9&st=wb2ky432',
    description: 'Konprann entèlijans atifisyèl ki dèyè Facebook ak Instagram.',
    resources: [
      { id: 201, lessonId: 2, title: 'Tablo Algorithm 2024', url: '#', type: 'pdf' },
      { id: 202, lessonId: 2, title: 'Blog Facebook Engineering', url: 'https://engineering.fb.com', type: 'link' }
    ]
  },
  {
    id: 3,
    moduleId: 2,
    title: 'Piblisite Facebook/Instagram',
    duration: '24:00',
    status: 'active',
    thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=400',
    videoUrl: 'https://dl.dropboxusercontent.com/scl/fi/ghgi5di5x5548k3zidyls/Ajoute-yon-nimewo-WhatsApp.mp4?rlkey=31gs4qe8wrbo5k7s3dpzgknq9&st=wb2ky432',
    description: 'Kijan pou nou kreye yon kanpay piblisite ki vize moun ki deja enterese nan pwodwi nou.',
    resources: [
      { id: 301, lessonId: 3, title: 'Modèl Kanpay', url: '#', type: 'pdf' },
      { id: 302, lessonId: 3, title: 'Facebook Ads Library', url: 'https://www.facebook.com/ads/library', type: 'link' }
    ]
  },
  {
    id: 4,
    moduleId: 2,
    title: 'Copywriting pou Konvèsyon',
    duration: '22:15',
    status: 'locked',
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=400',
    videoUrl: '',
    description: 'Kijan pou ekri tèks ki vann san fòse moun nan.'
  },
  {
    id: 5,
    moduleId: 3,
    title: 'Analize done ou',
    duration: '30:00',
    status: 'locked',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bbbda5462875?auto=format&fit=crop&q=80&w=400',
    videoUrl: '',
    description: 'Gade nimewo yo pou konnen si ou fè benefis oswa ou pèdi lajan.'
  },
  {
    id: 6,
    moduleId: 3,
    title: 'Scalling kanpay ou',
    duration: '25:30',
    status: 'locked',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400',
    videoUrl: '',
    description: 'Metòd pou pase de $10 pa jou a $1000 pa jou.'
  }
];

import { useAuth } from './context/AuthContext';
import { AuthView } from './components/AuthView';
import { PaymentView } from './components/PaymentView';

export default function App() {
  const { user, profile, loading } = useAuth();
  const [authType, setAuthType] = useState<'login' | 'signup'>('login');
  
  const [view, setView] = useState<View>('landing');

  const [modules, setModules] = useState<Module[]>(() => {
    const saved = localStorage.getItem('course_modules');
    return saved ? JSON.parse(saved) : INITIAL_MODULES;
  });

  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem('course_lessons');
    return saved ? JSON.parse(saved) : INITIAL_LESSONS;
  });

  const [activeTab, setActiveTab] = useState<Tab>('Deskripsyon');
  const [activeLessonId, setActiveLessonId] = useState(() => {
    return Number(localStorage.getItem('active_lesson_id')) || 3;
  });
  const [notes, setNotes] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem('lesson_notes');
    return saved ? JSON.parse(saved) : {};
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState('720p');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState<number[]>([]); // Modules collapsed by default
  
  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId) 
        : [...prev, moduleId]
    );
  };
  
  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('course_comments');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [newComment, setNewComment] = useState('');
  
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('user_stats');
    return saved ? JSON.parse(saved) : {
      streak: 0,
      lastVisit: new Date().toISOString(),
      totalPoints: 0,
      completedLessons: []
    };
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('course_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [showNotifications, setShowNotifications] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streakProcessed = useRef(false);

  // Sync userStats with profile VIP status
  useEffect(() => {
    if (profile) {
      setUserStats(prev => ({ ...prev, isVIP: profile.isVIP }));
    }
  }, [profile]);

  const addNotification = (title: string, message: string, type: 'streak' | 'lesson' | 'system') => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9) + Date.now(),
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    
    // Play sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Audio play failed, user interaction needed", e));
    }
  };

  const activeLesson = lessons.find(l => l.id === activeLessonId) || lessons[0] || INITIAL_LESSONS[2];
  const videoUrl = activeLesson.videoUrl || "https://dl.dropboxusercontent.com/scl/fi/ghgi5di5x5548k3zidyls/Ajoute-yon-nimewo-WhatsApp.mp4?rlkey=31gs4qe8wrbo5k7s3dpzgknq9&st=wb2ky432";

  // Streak calculation logic
  useEffect(() => {
    if (streakProcessed.current) return;
    streakProcessed.current = true;

    const lastVisitDate = new Date(userStats.lastVisit);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastVisitDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day!
      setUserStats(prev => ({
        ...prev,
        streak: prev.streak + 1,
        lastVisit: today.toISOString()
      }));
      addNotification("Bravo!", `Ou gen yon seri de ${userStats.streak + 1} jou! Kontinye konsa. 🔥`, 'streak');
    } else if (diffDays > 1) {
      // Streak broken
      setUserStats(prev => ({
        ...prev,
        streak: 1,
        lastVisit: today.toISOString()
      }));
      addNotification("Oups!", "Ou te manke yon jou, men m fèk rekòmanse seri a pou ou. Pa lage! 💪", 'streak');
    } else if (userStats.streak === 0) {
      // First day
      setUserStats(prev => ({
        ...prev,
        streak: 1,
        lastVisit: today.toISOString()
      }));
      addNotification("Byenvini!", "Ou kòmanse premye jou seri ou jodi a! 🚀", 'streak');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('user_stats', JSON.stringify(userStats));
    localStorage.setItem('course_comments', JSON.stringify(comments));
    localStorage.setItem('course_notifications', JSON.stringify(notifications));
    localStorage.setItem('active_tab', activeTab);
  }, [userStats, comments, notifications, activeTab]);

  useEffect(() => {
    if (saveStatus === 'saving') {
      const timer = setTimeout(() => setSaveStatus('saved'), 600);
      return () => clearTimeout(timer);
    }
    if (saveStatus === 'saved') {
      const timer = setTimeout(() => setSaveStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  useEffect(() => {
    const checkCache = async () => {
      if ('caches' in window) {
        const cache = await caches.open('video-offline-cache');
        const match = await cache.match(videoUrl);
        setIsOfflineSaved(!!match);
      }
    };
    checkCache();
  }, [videoUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-primary"
        >
          <Sparkles size={48} />
        </motion.div>
      </div>
    );
  }

  if (!user && view !== 'landing') {
    return (
      <AuthView 
        type={authType} 
        onSwitch={() => setAuthType(authType === 'login' ? 'signup' : 'login')} 
        onSuccess={() => setView('course')} 
      />
    );
  }

  if (view === 'vip' && !userStats.isVIP) {
    return <PaymentView onBack={() => setView('course')} onSuccess={() => setView('course')} />;
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9) + Date.now(),
      lessonId: activeLessonId,
      userName: 'Dukens Mathieu', // Simulated user
      userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100',
      content: newComment,
      timestamp: 'Kounye a',
      likes: 0
    };
    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleNoteChange = (text: string) => {
    setNotes(prev => ({ ...prev, [activeLessonId]: text }));
    setSaveStatus('saving');
  };

  // Video Handlers
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const toggleFullscreen = () => {
    if (videoRef.current?.parentElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.parentElement.requestFullscreen();
      }
    }
  };

  const toggleOfflineSave = async () => {
    if ('caches' in window) {
      const cache = await caches.open('video-offline-cache');
      if (isOfflineSaved) {
        try {
          await cache.delete(videoUrl);
          setIsOfflineSaved(false);
        } catch (e) {
          console.error("Error deleting cache:", e);
        }
      } else {
        try {
          // We use fetch with 'no-cors' for external URLs that might not have CORS headers
          // Opaque responses can still be stored in the Cache API
          const response = await fetch(videoUrl, { mode: 'no-cors' });
          await cache.put(videoUrl, response);
          setIsOfflineSaved(true);
        } catch (error) {
          console.error("Failed to save for offline", error);
          alert("Pa kapab sove videyo sa a pou kounye a. Sa ka rive akòz restriksyon sekirite (CORS) sou lyen videyo a.");
        }
      }
    }
  };

  const openLesson = (id: number) => {
    const lesson = lessons.find(l => l.id === id);
    if (lesson && lesson.status !== 'locked') {
      setActiveLessonId(id);
      setView('lesson');
    }
  };

  const toggleFavorite = (e: MouseEvent, lessonId: number) => {
    e.stopPropagation();
    setLessons(prev => prev.map(l => 
      l.id === lessonId ? { ...l, isFavorite: !l.isFavorite } : l
    ));
  };

  const handleAdminSave = (newModules: Module[], newLessons: Lesson[]) => {
    setModules(newModules);
    setLessons(newLessons);
    setView('course');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface">
      {/* Top Navigation */}
      {view !== 'landing' && (
        <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-primary border-b border-outline-variant shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (view === 'lesson' || view === 'profile' || view === 'resources' || view === 'vip') setView('course');
                else if (view === 'admin') setView('profile');
              }}
              className="text-on-primary p-2 hover:bg-white/10 transition-colors rounded-full"
            >
              {view === 'course' ? <Home size={24} /> : <ArrowLeft size={24} />}
            </button>
            <h1 className="font-headline text-lg font-bold text-on-primary truncate max-w-[200px]">
              {view === 'lesson' ? activeLesson.title : 
               view === 'profile' ? 'Profil Ou' :
               view === 'admin' ? 'Edisyon Kou' :
               view === 'resources' ? 'Resous' :
               view === 'vip' ? 'Espas VIP' :
               view === 'ai' ? 'Asistan AI' :
               'Kou Piblisite 2024'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Notification Button */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`text-on-primary p-2 hover:bg-white/10 transition-colors rounded-full relative ${showNotifications ? 'bg-white/10' : ''}`}
              >
                {notifications.some(n => !n.read) ? <BellRing size={22} className="animate-pulse" /> : <Bell size={22} />}
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-orange-500 text-[10px] text-white font-bold flex items-center justify-center rounded-full border border-primary">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
  
              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-surface border border-outline-variant rounded-3xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-outline-variant flex items-center justify-between">
                      <h3 className="font-bold text-primary">Notifikasyon</h3>
                      <button 
                        onClick={() => {
                          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        }}
                        className="text-[10px] font-bold text-secondary uppercase tracking-widest hover:underline"
                      >
                        Mete tout kòm li
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto no-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`p-4 border-b border-outline-variant/30 flex gap-4 hover:bg-surface-container-low transition-colors ${!notif.read ? 'bg-secondary/5' : ''}`}
                          >
                            <div className={`p-2 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center ${
                              notif.type === 'streak' ? 'bg-orange-100 text-orange-600' : 
                              notif.type === 'lesson' ? 'bg-blue-100 text-blue-600' :
                              'bg-surface-container text-outline'
                            }`}>
                              {notif.type === 'streak' ? <Flame size={20} fill="currentColor" /> : <Bell size={20} />}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-xs text-primary">{notif.title}</h4>
                                <span className="text-[10px] text-outline font-medium">{notif.timestamp}</span>
                              </div>
                              <p className="text-[10.5px] text-on-surface-variant leading-relaxed">
                                {notif.message}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-10 flex flex-col items-center justify-center text-center px-6">
                          <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center text-outline opacity-20 mb-3">
                            <Bell size={24} />
                          </div>
                          <p className="text-xs text-on-surface-variant italic font-medium">Ou pa gen okenn notifikasyon ankò.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
  
            <button 
              onClick={() => setView('profile')}
              className={`w-10 h-10 rounded-full bg-secondary-container border-2 overflow-hidden transition-all ${view === 'profile' ? 'border-secondary scale-110 shadow-lg' : 'border-on-primary hover:scale-105'}`}
            >
              <img 
                alt="Avatar" 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </header>
      )}

      {/* Hidden Audio for Notifications */}
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />

      <main className={`${view === 'landing' ? 'pt-0' : 'pt-16'} pb-32 lg:pb-24 flex-1`}>
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <motion.div
              key="landing-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LandingPage onStart={() => setView('course')} />
            </motion.div>
          )}

          {view === 'course' && (
            <motion.div 
              key="course-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4 space-y-8"
            >
              {/* Profile Card */}
              <div className="bg-primary-container text-on-primary p-6 rounded-3xl shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold font-headline">Bonjou, Étudiant!</h2>
                    <div className="flex items-center gap-3">
                      <p className="text-on-primary-container opacity-80 text-sm">Ou konplete 2/6 leson mwa sa.</p>
                      <span className="w-1 h-1 bg-white/20 rounded-full" />
                      <div className="flex items-center gap-1 text-secondary font-black text-xs">
                        <Flame size={14} fill="currentColor" />
                        {userStats.streak} JOU
                      </div>
                    </div>
                  </div>
                  <div className="bg-secondary p-3 rounded-2xl">
                    <Trophy className="text-on-secondary" size={24} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-60">
                    <span>Progrezou</span>
                    <span>33%</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-secondary rounded-full" />
                  </div>
                </div>
              </div>

              {/* VIP Quick Action Button */}
              {!userStats.isVIP && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-2"
                >
                  <motion.button 
                    onClick={() => setView('vip')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full py-4 bg-gradient-to-r from-secondary-container via-secondary to-secondary-container text-on-secondary font-black rounded-2xl shadow-xl shadow-secondary/20 flex items-center justify-center gap-3 group overflow-hidden border border-secondary/30"
                  >
                    <motion.div 
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                    />
                    <Crown size={20} className="relative z-10 group-hover:rotate-12 transition-transform" />
                    <span className="relative z-10 uppercase tracking-widest text-xs">Vin VIP Kounye a</span>
                  </motion.button>
                </motion.div>
              )}

              {/* Search Bar */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors" size={20} />
                <input 
                  type="text"
                  placeholder="Chèche yon leson..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm font-medium"
                />
              </div>

              {/* Modules List */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                    <Layers size={20} className="text-secondary" />
                    Kourikoulòm lan
                  </h3>
                  <button 
                    onClick={() => setOnlyFavorites(!onlyFavorites)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      onlyFavorites 
                        ? 'bg-secondary text-on-secondary shadow-lg shadow-secondary/20' 
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <Heart size={14} fill={onlyFavorites ? "currentColor" : "none"} />
                    {onlyFavorites ? 'Tout leson' : 'Favori'}
                  </button>
                </div>
                
                {modules.map((module) => {
                  const moduleLessons = lessons.filter(l => module.lessons.includes(l.id));
                  const completedCount = moduleLessons.filter(l => l.status === 'completed').length;
                  const progressPercentage = moduleLessons.length > 0 
                    ? Math.round((completedCount / moduleLessons.length) * 100) 
                    : 0;
                  
                  let filteredLessons = onlyFavorites 
                    ? moduleLessons.filter(l => l.isFavorite)
                    : moduleLessons;

                  if (searchQuery.trim()) {
                    filteredLessons = filteredLessons.filter(l => 
                      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      l.description.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                  }

                  const isExpanded = expandedModules.includes(module.id);

                  if ((onlyFavorites || searchQuery.trim()) && filteredLessons.length === 0) return null;

                  return (
                    <div key={module.id} className="bg-surface-container-low/30 rounded-[2.5rem] border border-outline-variant/30 overflow-hidden">
                      <button 
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex gap-4 items-center p-5 text-left hover:bg-surface-container-low transition-colors"
                      >
                        {module.thumbnail && (
                          <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-md border border-outline-variant/20">
                            <img src={module.thumbnail} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-black text-primary uppercase tracking-wider truncate">{module.title}</h4>
                            <div className="flex items-center gap-2">
                              {isExpanded ? <ChevronUp size={20} className="text-outline" /> : <ChevronDown size={20} className="text-outline" />}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5">
                            <div className="h-1.5 flex-1 max-w-[100px] bg-surface-container rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                className="h-full bg-secondary"
                              />
                            </div>
                            <span className="text-[10px] font-black text-secondary whitespace-nowrap">{progressPercentage}% DONE</span>
                          </div>
                          <p className="text-[10px] text-on-surface-variant font-bold mt-2 uppercase tracking-tight opacity-70">
                            {filteredLessons.length} Leson • {module.description.slice(0, 40)}...
                          </p>
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-5 space-y-3">
                              {filteredLessons.map(lesson => (
                                <div key={lesson.id} className="relative group">
                                  <button 
                                    onClick={() => openLesson(lesson.id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                                      lesson.status === 'active' 
                                        ? 'bg-secondary/5 border-secondary ring-1 ring-secondary' 
                                        : 'bg-surface border-outline-variant/30 hover:border-outline-variant hover:bg-surface-container-low'
                                    } ${lesson.status === 'locked' ? 'opacity-60 cursor-not-allowed' : ''}`}
                                  >
                                    <div className="relative w-16 h-12 rounded-xl overflow-hidden shrink-0 bg-surface-dim flex items-center justify-center">
                                      {lesson.thumbnail ? (
                                        <img src={lesson.thumbnail} className="w-full h-full object-cover" />
                                      ) : null}
                                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                        {lesson.status === 'completed' && <CheckCircle2 size={20} className="text-on-primary fill-secondary" />}
                                        {lesson.status === 'active' && <PlayCircle size={20} className="text-on-primary fill-secondary/50 group-hover:scale-110 transition-transform" />}
                                        {lesson.status === 'locked' && <Lock size={16} className="text-white" />}
                                      </div>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 pr-8">
                                      <h5 className="font-bold text-sm truncate text-primary">{lesson.title}</h5>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className="flex items-center gap-1 text-[10px] text-outline font-bold">
                                          <Clock size={10} />
                                          {lesson.duration}
                                        </span>
                                        {lesson.status === 'completed' ? (
                                          <span className="text-[10px] text-green-600 font-bold uppercase tracking-tight">Fini</span>
                                        ) : lesson.status === 'active' ? (
                                          <span className="text-[10px] text-secondary font-bold uppercase tracking-tight animate-pulse">Kounye a</span>
                                        ) : (
                                          <span className="text-[10px] text-outline font-bold uppercase tracking-tight">Fèmen</span>
                                        )}
                                      </div>
                                    </div>
                                  </button>

                                  <button 
                                    onClick={(e) => toggleFavorite(e, lesson.id)}
                                    className={`absolute top-4 right-4 p-2 rounded-full transition-all hover:bg-surface-container-high z-10 ${
                                      lesson.isFavorite ? 'text-secondary scale-110' : 'text-outline opacity-40 hover:opacity-100'
                                    }`}
                                  >
                                    <Heart size={18} fill={lesson.isFavorite ? "currentColor" : "none"} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
                {onlyFavorites && lessons.every(l => !l.isFavorite) && (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="p-4 bg-surface-container rounded-full text-outline opacity-20">
                      <Heart size={48} />
                    </div>
                    <p className="text-sm text-on-surface-variant italic">Ou pa gen okenn leson nan favori ankò.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'resources' && (
            <ResourcesView 
              lessons={lessons} 
              onOpenLesson={openLesson}
            />
          )}

          {view === 'profile' && (
            <motion.div
              key="profile-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
            >
              <ProfileView 
                onNavigate={setView}
                userStats={userStats}
              />
            </motion.div>
          )}

          {view === 'admin' && (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <AdminPanel 
                modules={modules}
                lessons={lessons}
                onSave={handleAdminSave}
                onClose={() => setView('profile')}
              />
            </motion.div>
          )}

          {view === 'ai' && (
            <motion.div
              key="ai-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ChatBot 
                userStats={userStats} 
                faqs={FAQS} 
                courseModules={modules} 
                isView
              />
            </motion.div>
          )}

          {view === 'lesson' && (
            <motion.div 
              key="lesson-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              {/* Video Player Section */}
              <section 
                className="w-full bg-black relative min-h-[225px] flex items-center justify-center group overflow-hidden"
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => isPlaying && setShowControls(false)}
              >
                <video 
                  ref={videoRef}
                  className="max-w-full max-h-[80vh] w-auto h-auto cursor-pointer"
                  src={videoUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onClick={togglePlay}
                />
                
                {/* Custom Video Controls Overlay */}
                <AnimatePresence>
                  {showControls && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/80 via-transparent to-black/20"
                    >
                      <div className="flex justify-end">
                        <span className="bg-secondary text-on-secondary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">LIVE</span>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        {/* Progress Bar */}
                        <div className="w-full group/progress relative">
                          <input 
                            type="range"
                            min={0}
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer accent-secondary relative z-20"
                            style={{
                              background: `linear-gradient(to right, var(--color-secondary) ${(currentTime / duration) * 100}%, rgba(255, 255, 255, 0.3) ${(currentTime / duration) * 100}%)`
                            }}
                          />
                        </div>
                        
                        {/* Control Buttons */}
                        <div className="flex items-center justify-between text-on-primary relative">
                          <div className="flex items-center gap-4 sm:gap-6">
                            <button 
                              onClick={() => skip(-10)}
                              className="hover:text-secondary transition-colors"
                              title="Skip backward 10s"
                            >
                              <RotateCcw size={20} />
                            </button>
                            <button 
                              onClick={togglePlay}
                              className="hover:text-secondary transition-colors"
                            >
                              {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
                            </button>
                            <button 
                              onClick={() => skip(10)}
                              className="hover:text-secondary transition-colors"
                              title="Skip forward 10s"
                            >
                              <RotateCw size={20} />
                            </button>
                            <div className="flex items-center gap-2 group/volume ml-2">
                              <button 
                                onClick={toggleMute}
                                className="hover:text-secondary transition-colors"
                              >
                                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                              </button>
                              <input 
                                type="range"
                                min={0}
                                max={1}
                                step={0.1}
                                value={isMuted ? 0 : volume}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  setVolume(val);
                                  if (videoRef.current) videoRef.current.volume = val;
                                  setIsMuted(val === 0);
                                }}
                                className="w-0 group-hover/volume:w-16 transition-all duration-300 h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-white"
                              />
                            </div>
                            <span className="text-[11px] font-bold tabular-nums tracking-wide hidden sm:inline">
                              {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 sm:gap-6">
                            <div className="relative">
                              <button 
                                onClick={() => setShowSettings(!showSettings)}
                                className={`hover:text-secondary transition-all ${showSettings ? 'text-secondary scale-110' : ''}`}
                              >
                                <Settings size={20} />
                              </button>
                              
                              {/* Settings Dropdown */}
                              <AnimatePresence>
                                {showSettings && (
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute bottom-full right-0 mb-4 w-56 bg-black/95 backdrop-blur-xl rounded-2xl border border-white/10 p-1.5 z-50 overflow-hidden shadow-2xl"
                                  >
                                    <div className="p-2 border-b border-white/5 mb-1">
                                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-2">Kalitye</span>
                                      <div className="mt-1.5 grid grid-cols-3 gap-1">
                                        {['1080p', '720p', '360p'].map((q) => (
                                          <button 
                                            key={q}
                                            onClick={() => {
                                              setQuality(q);
                                            }}
                                            className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                              quality === q 
                                                ? 'bg-secondary text-white' 
                                                : 'text-white/60 hover:bg-white/10'
                                            }`}
                                          >
                                            {q}
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="p-2 border-b border-white/5 mb-1">
                                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-2">Vitès</span>
                                      <div className="mt-1.5 grid grid-cols-4 gap-1">
                                        {[0.5, 1, 1.5, 2].map((s) => (
                                          <button 
                                            key={s}
                                            onClick={() => {
                                              setPlaybackSpeed(s);
                                              if (videoRef.current) videoRef.current.playbackRate = s;
                                            }}
                                            className={`px-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                              playbackSpeed === s 
                                                ? 'bg-secondary text-white' 
                                                : 'text-white/60 hover:bg-white/10'
                                            }`}
                                          >
                                            {s}x
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="p-1">
                                      <button 
                                        onClick={toggleOfflineSave}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors text-white"
                                      >
                                        <Download size={14} className={isOfflineSaved ? 'text-secondary' : 'text-white/60'} />
                                        <span className="flex-1 text-left font-headline lowercase">{isOfflineSaved ? 'Retire offline' : 'Mete offline'}</span>
                                        {isOfflineSaved && <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />}
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            <button 
                              onClick={toggleFullscreen}
                              className="hover:text-secondary transition-colors"
                            >
                              <Maximize size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Big Play Button when paused */}
                {!isPlaying && (
                  <button 
                    onClick={togglePlay}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-secondary/90 rounded-full flex items-center justify-center text-on-secondary shadow-xl hover:scale-110 transition-transform active:scale-95"
                  >
                    <Play size={32} fill="currentColor" />
                  </button>
                )}
              </section>

              {/* Lesson Info */}
              <section className="px-4 py-8 bg-surface">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-secondary font-bold text-xs uppercase tracking-widest">Modil {activeLesson.moduleId}</span>
                    <span className="w-1 h-1 bg-outline rounded-full" />
                    <span className="text-on-surface-variant text-xs font-medium">Lesson {activeLesson.id}</span>
                  </div>
                  <button 
                    onClick={(e) => toggleFavorite(e, activeLesson.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs transition-all ${
                      activeLesson.isFavorite 
                        ? 'bg-secondary/10 text-secondary border border-secondary/20 scale-105' 
                        : 'bg-surface-container text-outline border border-transparent'
                    }`}
                  >
                    <Heart size={16} fill={activeLesson.isFavorite ? "currentColor" : "none"} />
                    {activeLesson.isFavorite ? 'Nan Favori' : 'Mete n Favori'}
                  </button>
                </div>
                <h2 className="text-3xl font-bold text-primary mb-3 leading-tight">
                  {activeLesson.title}
                </h2>
                <p className="text-on-surface-variant text-base leading-relaxed">
                  {activeLesson.description}
                </p>
              </section>

              {/* VIP Upgrade CTA */}
              {!userStats.isVIP && (
                <section className="px-4 py-2">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-container to-secondary/20 p-6 rounded-[2.5rem] border border-secondary/20 shadow-xl group"
                  >
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-secondary/10 blur-[60px] rounded-full group-hover:bg-secondary/20 transition-all duration-700" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center shadow-lg shadow-secondary/30 shrink-0 transform -rotate-6 group-hover:rotate-0 transition-transform">
                        <Crown size={28} />
                      </div>
                      <div className="flex-1 text-center md:text-left space-y-1">
                        <h3 className="text-lg font-black text-on-primary font-headline">Vle ale pi lwen?</h3>
                        <p className="text-[11px] text-on-primary/70 font-medium leading-relaxed">
                          Pase nan <span className="text-secondary font-black">VIP Mastermind</span> pou jwenn coaching prive ak resous eksklizif.
                        </p>
                      </div>
                      <motion.button 
                        onClick={() => setView('vip')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative overflow-hidden bg-secondary text-on-secondary px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-secondary/30 hover:brightness-110 transition-all"
                      >
                        <motion.div 
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                        />
                        <span className="relative z-10 flex items-center gap-2">
                          <Crown size={12} />
                          Debloke VIP
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                </section>
              )}

              {/* Tabbed Content */}
              <section className="mt-2 border-t border-outline-variant bg-surface">
                <div className="flex border-b border-outline-variant px-4 overflow-x-auto no-scrollbar">
                  {(['Deskripsyon', 'Resous', 'Nòt', 'Kòmantè'] as Tab[]).map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-6 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
                        activeTab === tab 
                          ? 'text-secondary border-secondary' 
                          : 'text-on-surface-variant border-transparent hover:text-primary'
                      }`}
                    >
                      {tab === 'Resous' ? `Resous (${activeLesson.resources?.length || 0})` : 
                       tab === 'Kòmantè' ? `Komantè (${comments.filter(c => c.lessonId === activeLessonId).length})` : 
                       tab}
                    </button>
                  ))}
                </div>

                <div className="p-6 min-h-[300px]">
                  <AnimatePresence mode="wait">
                    {activeTab === 'Deskripsyon' && (
                      <motion.div 
                        key="deskripsyon"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <h3 className="font-bold text-xs text-primary uppercase tracking-widest">Objektif Leson an</h3>
                        <ul className="space-y-4">
                          {[
                            "Konprann algoritm Meta pou ane 2024 la.",
                            "Kreye yon \"Custom Audience\" ak baz done kliyan ou.",
                            "Konfigire yon \"Lookalike Audience\" pou jwenn nouvo kliyan."
                          ].map((objective, idx) => (
                            <li key={idx} className="flex gap-4 items-start">
                              <CheckSquare className="text-secondary shrink-0 mt-0.5" size={20} fill="currentColor" strokeWidth={1} />
                              <span className="text-on-surface-variant text-sm font-medium leading-relaxed">
                                {objective}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}

                    {activeTab === 'Nòt' && (
                      <motion.div
                        key="not"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-xs text-primary uppercase tracking-widest flex items-center gap-2">
                            <FileText size={14} />
                            Nòt pèsonèl ou
                          </h3>
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter">
                            {saveStatus === 'saving' && <span className="text-secondary animate-pulse">Ap sove...</span>}
                            {saveStatus === 'saved' && <span className="text-green-600 flex items-center gap-1"><Save size={10} /> Sove!</span>}
                          </div>
                        </div>
                        <textarea
                          value={notes[activeLessonId] || ''}
                          onChange={(e) => handleNoteChange(e.target.value)}
                          placeholder="Ekri nòt ou isit la pou leson sa a..."
                          className="w-full h-48 p-4 bg-surface-container-low border border-outline-variant rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm leading-relaxed text-on-surface"
                        />
                        <div className="flex justify-between items-center px-1">
                          <p className="text-[10px] text-outline font-medium">
                            {(notes[activeLessonId] || '').length} karaktè
                          </p>
                          <button 
                            onClick={() => handleNoteChange('')}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-error hover:bg-error/10 px-2 py-1 rounded-lg transition-colors"
                          >
                            <Trash2 size={12} />
                            Efase tout
                          </button>
                        </div>
                        <p className="text-[10px] text-outline font-medium">
                          Nòt ou yo sove otomatikman nan navigatè w la.
                        </p>
                      </motion.div>
                    )}

                    {activeTab === 'Resous' && (
                      <motion.div
                        key="resous"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        <h3 className="font-bold text-xs text-primary uppercase tracking-widest flex items-center gap-2">
                          <Download size={14} />
                          Materyèl pou telechaje
                        </h3>
                        {activeLesson.resources && activeLesson.resources.length > 0 ? (
                          <div className="grid gap-3">
                            {activeLesson.resources.map((res) => (
                              <a 
                                key={res.id}
                                href={res.url}
                                target="_blank"
                                rel="referrer"
                                className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-outline-variant hover:border-secondary transition-all group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-secondary/10 rounded-xl text-secondary group-hover:scale-110 transition-transform">
                                    <FileText size={20} />
                                  </div>
                                  <span className="text-sm font-bold text-primary">{res.title}</span>
                                </div>
                                <ChevronRight size={18} className="text-outline" />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-10 text-outline text-center space-y-2">
                            <Layers size={32} className="opacity-20" />
                            <p className="text-sm italic">Pa gen resous ki disponib pou leson sa a.</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                    {activeTab === 'Kòmantè' && (
                      <motion.div
                        key="komante"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        <div className="space-y-4">
                          <h3 className="font-bold text-xs text-primary uppercase tracking-widest flex items-center gap-2">
                            <MessageSquare size={14} />
                            Poze yon kesyon
                          </h3>
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1">
                              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 relative">
                              <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Ekri kesyon ou oswa kòmantè ou isit la..."
                                className="w-full min-h-[80px] p-4 bg-surface-container-low border border-outline-variant rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm leading-relaxed"
                              />
                              <button 
                                onClick={handleAddComment}
                                disabled={!newComment.trim()}
                                className="absolute bottom-3 right-3 p-2 rounded-xl bg-secondary text-on-secondary shadow-lg disabled:opacity-50 disabled:shadow-none hover:brightness-110 active:scale-95 transition-all"
                              >
                                <Send size={18} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-outline-variant/30">
                          {comments.filter(c => c.lessonId === activeLessonId).length > 0 ? (
                            comments.filter(c => c.lessonId === activeLessonId).map((comment) => (
                              <div key={comment.id} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                                  <img src={comment.userAvatar} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-primary">{comment.userName}</h4>
                                    <span className="text-[10px] text-outline">{comment.timestamp}</span>
                                  </div>
                                  <p className="text-sm text-on-surface-variant leading-relaxed">
                                    {comment.content}
                                  </p>
                                  <div className="flex items-center gap-4 pt-1">
                                    <button className="flex items-center gap-1.5 text-[10px] font-bold text-outline hover:text-secondary transition-colors">
                                      <Heart size={12} />
                                      {comment.likes}
                                    </button>
                                    <button className="text-[10px] font-bold text-outline hover:text-secondary transition-colors">
                                      Reponn
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-outline text-center space-y-2">
                              <MessageSquare size={32} className="opacity-20" />
                              <p className="text-sm italic">Pa gen kòmantè ankò. Se ou menm ki pou kòmanse!</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>

              {/* Next Lesson Section */}
              <section className="mt-8 px-4 mb-12">
                <h3 className="text-2xl font-bold text-primary mb-6">Pwochen leson</h3>
                {lessons.filter(l => l.moduleId === activeLesson.moduleId && l.id > activeLesson.id).slice(0, 1).map(next => (
                  <button 
                    key={next.id}
                    onClick={() => openLesson(next.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 text-left"
                  >
                    <div className="w-16 h-10 rounded-lg bg-surface-dim overflow-hidden shrink-0">
                      <img src={next.thumbnail} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-xs truncate text-primary">{next.title}</h5>
                      <p className="text-[10px] text-outline font-bold uppercase mt-0.5">Prepare pou swiv</p>
                    </div>
                    <ChevronRight size={16} className="text-outline" />
                  </button>
                ))}
              </section>
            </motion.div>
          )}
        </AnimatePresence>      </main>

      {view !== 'admin' && view !== 'landing' && (
        <nav className="fixed bottom-0 left-0 w-full z-40 bg-surface/80 backdrop-blur-lg border-t border-outline-variant/30 flex items-center justify-around py-3 lg:hidden safe-area-bottom">
          {[
            { id: 'course', icon: Home, label: 'Kou' },
            { id: 'resources', icon: BookOpen, label: 'Resous' },
            { id: 'ai', icon: Sparkles, label: 'Levo AI' },
            { id: 'vip', icon: Crown, label: 'VIP' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as View)}
              className="flex flex-col items-center gap-1 relative px-6 group"
            >
              <div className={`p-1.5 rounded-2xl transition-all duration-300 ${
                view === item.id 
                  ? 'bg-secondary/10 text-secondary scale-110' 
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}>
                <item.icon size={22} strokeWidth={view === item.id ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold tracking-tighter uppercase transition-colors ${
                view === item.id ? 'text-secondary' : 'text-on-surface-variant'
              }`}>
                {item.label}
              </span>
              {view === item.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -top-3 w-8 h-1 bg-secondary rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>
      )}

      {view === 'lesson' && (
        <footer className="fixed bottom-0 left-0 w-full z-50 bg-surface border-t border-outline-variant p-4 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] mb-16 lg:mb-0">
          <button 
            onClick={() => setView('course')}
            className="flex items-center gap-2 text-primary font-bold text-sm px-4 py-3 rounded-xl hover:bg-surface-variant transition-all active:scale-95"
          >
            <ChevronLeft size={20} />
            Tout leson
          </button>
          <button 
            onClick={() => view === 'course' ? openLesson(3) : setView('profile')}
            className="bg-secondary text-on-secondary px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-secondary/20 active:scale-95 hover:brightness-110 transition-all font-headline"
          >
            {view === 'course' ? 'Kontinye Kou a' : 
             view === 'profile' ? 'Tounen nan Kou a' : 
             'Kontinye Leson an'}
            <ChevronRight size={20} />
          </button>
        </footer>
      )}
    </div>
  );
}

import { 
  Plus, 
  Settings, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Layout, 
  PlayCircle,
  Clock,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  ExternalLink,
  CreditCard,
  Check,
  User as UserIcon,
  Search,
  Smartphone,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Module, Lesson, Status } from '../types';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface Payment {
  id: string;
  userId: string;
  userEmail: string;
  method: 'MonCash' | 'NatCash';
  transactionId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  planId?: string;
}

interface AdminPanelProps {
  modules: Module[];
  lessons: Lesson[];
  onSave: (modules: Module[], lessons: Lesson[]) => void;
  onClose: () => void;
}

// Helper to convert Dropbox links for direct streaming
const fixDropboxUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('dropbox.com')) {
    return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '').replace('?dl=1', '');
  }
  return url;
};

export default function AdminPanel({ modules: initialModules, lessons: initialLessons, onSave, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'payments'>('content');
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [editingModule, setEditingModule] = useState<Partial<Module> | null>(null);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentSearch, setPaymentSearch] = useState('');

  useEffect(() => {
    const pPath = 'payments';
    const q = query(collection(db, pPath));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Payment[];
      setPayments(pData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, pPath);
    });
    return () => unsubscribe();
  }, []);

  const handleApprovePayment = async (payment: Payment) => {
    if (!confirm('Èske ou sèten ou vle apwouve peman sa a?')) return;

    try {
      // 1. Update payment status
      const pPath = `payments/${payment.id}`;
      await updateDoc(doc(db, 'payments', payment.id), {
        status: 'approved',
        processedAt: serverTimestamp()
      }).catch(err => handleFirestoreError(err, OperationType.UPDATE, pPath));

      // 2. Grant VIP status to user
      const uPath = `users/${payment.userId}`;
      const userRef = doc(db, 'users', payment.userId);
      await updateDoc(userRef, {
        isVIP: true
      }).catch(err => handleFirestoreError(err, OperationType.UPDATE, uPath));

      alert('Peman apwouve ak siksè!');
    } catch (err: any) {
      console.error(err);
      alert('Erè: ' + err.message);
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    if (!confirm('Èske ou sèten ou vle rejte peman sa a?')) return;
    const pPath = `payments/${paymentId}`;
    try {
      await updateDoc(doc(db, 'payments', paymentId), {
        status: 'rejected',
        processedAt: serverTimestamp()
      }).catch(err => handleFirestoreError(err, OperationType.UPDATE, pPath));
    } catch (err: any) {
      console.error(err);
      alert('Erè: ' + err.message);
    }
  };

  const handleAddModule = () => {
    const newId = Math.max(...modules.map(m => m.id), 0) + 1;
    setEditingModule({ id: newId, title: '', description: '', thumbnail: '', lessons: [] });
  };

  const handleAddLesson = (moduleId: number) => {
    const newId = Math.max(...lessons.map(l => l.id), 0) + 1;
    setEditingLesson({ 
      id: newId, 
      moduleId, 
      title: '', 
      duration: '00:00', 
      status: 'locked' as Status, 
      thumbnail: '', 
      videoUrl: '',
      description: '' 
    });
  };

  const saveModule = () => {
    if (!editingModule) return;
    const exists = modules.find(m => m.id === editingModule.id);
    if (exists) {
      setModules(modules.map(m => m.id === editingModule.id ? { ...m, ...editingModule } as Module : m));
    } else {
      setModules([...modules, { ...editingModule, lessons: [] } as Module]);
    }
    setEditingModule(null);
  };

  const saveLesson = () => {
    if (!editingLesson) return;
    
    // Auto-fix video URL if it's a Dropbox link
    const sanitizedLesson = {
      ...editingLesson,
      videoUrl: fixDropboxUrl(editingLesson.videoUrl || '')
    };

    const exists = lessons.find(l => l.id === sanitizedLesson.id);
    let newLessons = lessons;
    if (exists) {
      newLessons = lessons.map(l => l.id === sanitizedLesson.id ? { ...l, ...sanitizedLesson } as Lesson : l);
    } else {
      const newLesson = { ...sanitizedLesson } as Lesson;
      newLessons = [...lessons, newLesson];
      // Update module's lesson list
      setModules(modules.map(m => m.id === newLesson.moduleId ? { ...m, lessons: [...m.lessons, newLesson.id] } : m));
    }
    setLessons(newLessons);
    setEditingLesson(null);
  };

  const deleteModule = (id: number) => {
    setModules(modules.filter(m => m.id !== id));
    setLessons(lessons.filter(l => l.moduleId !== id));
  };

  const deleteLesson = (id: number) => {
    setLessons(lessons.filter(l => l.id !== id));
    setModules(modules.map(m => ({ ...m, lessons: m.lessons.filter(lid => lid !== id) })));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 bg-background min-h-screen text-on-surface"
    >
      <header className="flex items-center justify-between mb-8 border-b border-outline-variant pb-4">
        <div>
          <h2 className="text-xl font-bold font-headline flex items-center gap-2">
            <Settings className="text-secondary" />
            Admin Dashboard
          </h2>
          <p className="text-xs text-on-surface-variant italic">Mizajou kou a an tan reyèl</p>
        </div>
        <div className="flex gap-2">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSave(modules, lessons)}
            className="bg-secondary text-on-secondary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:brightness-110 shadow-lg shadow-secondary/10"
          >
            <Save size={16} />
            Pibliye
          </motion.button>
          <button 
            onClick={onClose}
            className="bg-surface-container-high p-2 rounded-xl hover:bg-surface-container-highest transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'content' ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'
          }`}
        >
          Resous/Modil
        </button>
        <button 
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
            activeTab === 'payments' ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'
          }`}
        >
          Peman VIP {payments.filter(p => p.status === 'pending').length > 0 && (
            <span className="w-2 h-2 bg-error rounded-full animate-pulse" />
          )}
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === 'content' ? (
          <>
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-sm uppercase tracking-widest text-secondary flex items-center gap-2">
                <Layout size={16} />
                Modil yo ({modules.length})
              </h3>
              <motion.button 
                whileHover={{ x: 3 }}
                onClick={handleAddModule}
                className="text-secondary flex items-center gap-1 font-bold text-xs hover:bg-secondary/10 px-2 py-1 rounded-lg"
              >
                <Plus size={16} />
                Ajoute Modil
              </motion.button>
            </div>

            <div className="space-y-4">
              {modules.map(module => (
                <div key={module.id} className="border border-outline-variant/30 rounded-2xl overflow-hidden bg-surface-container-low">
                  <div className="p-4 flex items-center justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                    >
                      <h4 className="font-bold text-primary">{module.title}</h4>
                      <p className="text-[10px] text-outline font-medium">{module.lessons.length} leson</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setEditingModule(module)}
                        className="p-1.5 hover:text-secondary hover:bg-secondary/10 rounded-lg"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteModule(module.id)}
                        className="p-1.5 hover:text-error hover:bg-error/10 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="w-px h-6 bg-outline-variant/30 mx-1" />
                      <button 
                        onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                        className="p-1.5 text-outline"
                      >
                        {expandedModule === module.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedModule === module.id && (
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-outline-variant/20 bg-surface-container/30"
                      >
                        <div className="p-4 space-y-3">
                          {lessons.filter(l => l.moduleId === module.id).map(lesson => (
                            <div key={lesson.id} className="flex items-center justify-between p-3 bg-background rounded-xl border border-outline-variant/20 group">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-6 rounded bg-surface-dim overflow-hidden">
                                  <img src={lesson.thumbnail} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <h5 className="text-xs font-bold text-primary">{lesson.title}</h5>
                                  <p className="text-[9px] text-outline">{lesson.duration}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => setEditingLesson(lesson)}
                                  className="p-1 text-outline hover:text-secondary"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button 
                                  onClick={() => deleteLesson(lesson.id)}
                                  className="p-1 text-outline hover:text-error"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button 
                            onClick={() => handleAddLesson(module.id)}
                            className="w-full py-2 border-2 border-dashed border-outline-variant/30 rounded-xl text-[10px] font-bold text-outline hover:border-secondary/50 hover:text-secondary transition-all"
                          >
                            + Ajoute yon Leson
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                <CreditCard size={18} />
                Peman pou Verifye ({payments.filter(p => p.status === 'pending').length})
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={14} />
                <input 
                  type="text" 
                  value={paymentSearch}
                  onChange={e => setPaymentSearch(e.target.value)}
                  placeholder="Chache pa imèl oswa ID..."
                  className="pl-9 pr-4 py-2 bg-surface-container rounded-xl text-[10px] boder border-outline-variant outline-none focus:border-primary transition-all w-48"
                />
              </div>
            </div>

            <div className="space-y-3">
              {payments
                .filter(p => 
                  p.userEmail?.toLowerCase().includes(paymentSearch.toLowerCase()) || 
                  p.transactionId?.toLowerCase().includes(paymentSearch.toLowerCase())
                )
                .map(payment => (
                  <div 
                    key={payment.id} 
                    className={`p-5 rounded-[2rem] border transition-all ${
                      payment.status === 'pending' ? 'bg-secondary/5 border-secondary/30 ring-1 ring-secondary/10' : 'bg-surface-container-low border-outline-variant/30 opacity-70'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          payment.status === 'pending' ? 'bg-secondary text-on-secondary' : 'bg-outline-variant text-outline'
                        }`}>
                          <UserIcon size={24} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-primary truncate">{payment.userEmail}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                              payment.status === 'approved' ? 'bg-green-100 text-green-700' : 
                              payment.status === 'rejected' ? 'bg-error-container text-on-error-container' : 
                              'bg-secondary/20 text-secondary'
                            }`}>
                              {payment.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[10px] font-bold text-outline uppercase tracking-wider">
                            <span className="flex items-center gap-1"><Smartphone size={10} /> {payment.method}</span>
                            <span className="flex items-center gap-1"><Check size={10} /> {payment.transactionId}</span>
                            <span className="flex items-center gap-1"><Clock size={10} /> {payment.createdAt?.toDate ? payment.createdAt.toDate().toLocaleDateString() : 'Kounye a'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:self-center">
                        <div className="text-right mr-4 hidden md:block">
                          <p className="text-[10px] font-black text-outline uppercase">Montan</p>
                          <p className="text-lg font-black text-primary">{payment.amount} GDES</p>
                        </div>
                        {payment.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleRejectPayment(payment.id)}
                              className="bg-surface-container hover:bg-error-container hover:text-on-error-container p-3 rounded-xl transition-all"
                            >
                              <X size={20} />
                            </button>
                            <button 
                              onClick={() => handleApprovePayment(payment)}
                              className="bg-secondary text-on-secondary px-6 py-3 rounded-xl font-black text-xs shadow-lg shadow-secondary/30 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                            >
                              <Check size={18} />
                              APWOUVE
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
              ))}
              {payments.length === 0 && (
                <div className="py-20 text-center space-y-4 opacity-40">
                  <CreditCard size={48} className="mx-auto" />
                  <p className="text-sm font-black uppercase tracking-widest">Pa gen okenn peman yo jwenn</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal for Editing Module */}
      <AnimatePresence>
        {editingModule && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-container-high w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-6"
            >
              <h3 className="text-xl font-bold font-headline">Modifikasyon Modil</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Tit Modil la</label>
                  <input 
                    type="text" 
                    value={editingModule.title} 
                    onChange={e => setEditingModule({ ...editingModule, title: e.target.value })}
                    className="w-full bg-surface p-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-sm"
                    placeholder="E.g. Modil 1: Baz yo"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-outline">URL Foto Kouvèti (Module)</label>
                  <div className="flex items-center gap-2 bg-surface p-3 rounded-xl border border-outline-variant">
                    <ImageIcon size={16} className="text-outline" />
                    <input 
                      type="text" 
                      value={editingModule.thumbnail || ''} 
                      onChange={e => setEditingModule({ ...editingModule, thumbnail: e.target.value })}
                      className="bg-transparent outline-none text-sm w-full"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Deskripsyon</label>
                  <textarea 
                    value={editingModule.description} 
                    onChange={e => setEditingModule({ ...editingModule, description: e.target.value })}
                    className="w-full bg-surface p-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-sm h-24"
                    placeholder="Kisa modil sa a sou li?"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setEditingModule(null)}
                  className="flex-1 bg-surface py-3 rounded-xl font-bold text-sm border border-outline-variant"
                >
                  Anile
                </button>
                <button 
                  onClick={saveModule}
                  className="flex-1 bg-secondary text-on-secondary py-3 rounded-xl font-bold text-sm shadow-lg shadow-secondary/20"
                >
                  Sove Modil
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal for Editing Lesson */}
      <AnimatePresence>
        {editingLesson && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-container-high w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold font-headline flex items-center gap-2">
                <PlayCircle className="text-secondary" />
                Deta Leson an
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Tit Leson an</label>
                  <input 
                    type="text" 
                    value={editingLesson.title} 
                    onChange={e => setEditingLesson({ ...editingLesson, title: e.target.value })}
                    className="w-full bg-surface p-3 rounded-xl border border-outline-variant focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Dire (MM:SS)</label>
                  <div className="flex items-center gap-2 bg-surface p-3 rounded-xl border border-outline-variant">
                    <Clock size={16} className="text-outline" />
                    <input 
                      type="text" 
                      value={editingLesson.duration} 
                      onChange={e => setEditingLesson({ ...editingLesson, duration: e.target.value })}
                      className="bg-transparent outline-none text-sm w-full"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Estati</label>
                  <select 
                    value={editingLesson.status} 
                    onChange={e => setEditingLesson({ ...editingLesson, status: e.target.value as Status })}
                    className="w-full bg-surface p-3 rounded-xl border border-outline-variant text-sm outline-none"
                  >
                    <option value="locked">Fèmen (Locked)</option>
                    <option value="active">Aktif (Open)</option>
                    <option value="completed">Fini (Completed)</option>
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Lyen Videyo (Dropbox sipòte)</label>
                  <div className="flex items-center gap-2 bg-surface p-3 rounded-xl border border-outline-variant">
                    <Video size={16} className="text-outline" />
                    <input 
                      type="text" 
                      value={editingLesson.videoUrl || ''} 
                      onChange={e => setEditingLesson({ ...editingLesson, videoUrl: e.target.value })}
                      className="bg-transparent outline-none text-sm w-full"
                      placeholder="Mete lyen Dropbox oswa lòt..."
                    />
                  </div>
                  {editingLesson.videoUrl?.includes('dropbox') && (
                    <p className="text-[9px] text-green-500 font-medium px-1 flex items-center gap-1">
                      <ExternalLink size={10} /> Sistèm nan ap konvèti lyen Dropbox la otomatikman.
                    </p>
                  )}
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-outline">URL Foto Kouvèti (Leson)</label>
                  <div className="flex items-center gap-2 bg-surface p-3 rounded-xl border border-outline-variant">
                    <ImageIcon size={16} className="text-outline" />
                    <input 
                      type="text" 
                      value={editingLesson.thumbnail} 
                      onChange={e => setEditingLesson({ ...editingLesson, thumbnail: e.target.value })}
                      className="bg-transparent outline-none text-sm w-full"
                    />
                  </div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Deskripsyon</label>
                  <div className="flex items-start gap-2 bg-surface p-3 rounded-xl border border-outline-variant">
                    <FileText size={16} className="text-outline mt-1" />
                    <textarea 
                      value={editingLesson.description} 
                      onChange={e => setEditingLesson({ ...editingLesson, description: e.target.value })}
                      className="bg-transparent outline-none text-sm w-full h-24 resize-none"
                    />
                  </div>
                </div>

                {/* Resources Section */}
                <div className="md:col-span-2 pt-4 border-t border-outline-variant/30">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-primary">Resous (PDF, Lyen, elatriye)</label>
                    <button 
                      onClick={() => {
                        const res = editingLesson.resources || [];
                        setEditingLesson({ 
                          ...editingLesson, 
                          resources: [...res, { id: Date.now() + Math.random(), title: '', url: '' }] 
                        });
                      }}
                      className="text-secondary text-[10px] font-bold flex items-center gap-1 bg-secondary/10 px-2 py-1 rounded"
                    >
                      <Plus size={12} /> Ajoute Resous
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(editingLesson.resources || []).map((resource, idx) => (
                      <div key={resource.id} className="flex gap-2 items-center">
                        <input 
                          type="text" 
                          placeholder="Tit resous"
                          value={resource.title}
                          onChange={e => {
                            const newRes = [...(editingLesson.resources || [])];
                            newRes[idx].title = e.target.value;
                            setEditingLesson({ ...editingLesson, resources: newRes });
                          }}
                          className="flex-1 bg-surface p-2 rounded-lg border border-outline-variant text-[10px] outline-none"
                        />
                        <input 
                          type="text" 
                          placeholder="URL"
                          value={resource.url}
                          onChange={e => {
                            const newRes = [...(editingLesson.resources || [])];
                            newRes[idx].url = e.target.value;
                            setEditingLesson({ ...editingLesson, resources: newRes });
                          }}
                          className="flex-1 bg-surface p-2 rounded-lg border border-outline-variant text-[10px] outline-none"
                        />
                        <button 
                          onClick={() => {
                            const newRes = (editingLesson.resources || []).filter((_, i) => i !== idx);
                            setEditingLesson({ ...editingLesson, resources: newRes });
                          }}
                          className="p-2 text-error hover:bg-error/10 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button 
                  onClick={() => setEditingLesson(null)}
                  className="flex-1 bg-surface py-3 rounded-xl font-bold text-sm border border-outline-variant"
                >
                  Anile
                </button>
                <button 
                  onClick={saveLesson}
                  className="flex-1 bg-secondary text-on-secondary py-3 rounded-xl font-bold text-sm shadow-lg shadow-secondary/20"
                >
                  Sove Leson
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

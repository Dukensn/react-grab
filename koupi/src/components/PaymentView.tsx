import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Smartphone, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Send,
  Loader2,
  Crown
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

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

interface PaymentViewProps {
  onBack: () => void;
  onSuccess: () => void;
}

const PLANS = [
  {
    id: 'monthly',
    name: 'Mwa-pa-Mwa',
    price: 500,
    duration: 'Mwa',
    features: ['Tout kou yo', 'Sipò kominote', 'Resous sakre']
  },
  {
    id: 'yearly',
    name: 'Anyèl Master',
    price: 4500,
    duration: 'Ane',
    features: ['Tout sa ki nan Monthly', '2 mwa gratis', 'Coaching prive', 'Priorite sipò'],
    popular: true
  }
];

export const PaymentView: React.FC<PaymentViewProps> = ({ onBack, onSuccess }) => {
  const { user, profile } = useAuth();
  const [step, setStep] = useState<'plans' | 'method' | 'form'>('plans');
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]);
  const [paymentMethod, setPaymentMethod] = useState<'MonCash' | 'NatCash' | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const MONCASH_NUMBER = "4317-7870";
  const NATCASH_NUMBER = "4317-7870";

  const handleApply = async () => {
    if (!transactionId || !paymentMethod) {
      setError('Tanpri antre nimewo tranzaksyon an');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const pPath = 'payments';
      await addDoc(collection(db, pPath), {
        userId: user?.uid,
        userEmail: user?.email,
        method: paymentMethod,
        transactionId: transactionId,
        amount: selectedPlan.price,
        planId: selectedPlan.id,
        status: 'pending',
        createdAt: serverTimestamp()
      }).catch(err => handleFirestoreError(err, OperationType.CREATE, pPath));
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Kopye nan clipboard!');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-surface-container-low p-8 rounded-[2.5rem] border border-outline-variant text-center"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black mb-2 text-primary">Tranzaksyon voye!</h2>
          <p className="text-on-surface-variant text-sm font-medium leading-relaxed mb-8">
            Nou resevwa enfòmasyon ou yo. Yon admin pral verifye peman an nan mwens pase 24h. W ap jwenn yon notifikasyon lè kont ou pase VIP.
          </p>
          <button 
            onClick={onSuccess}
            className="w-full py-4 bg-primary text-on-primary font-black rounded-2xl uppercase tracking-widest text-xs"
          >
            Mèsi, Kontinye
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col p-4">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-3 bg-surface-container rounded-2xl">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-black text-primary font-headline">Upgrade to VIP</h1>
      </header>

      <div className="flex-1 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 'plans' && (
            <motion.div 
              key="plans"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                {PLANS.map(plan => (
                  <button 
                    key={plan.id}
                    onClick={() => { setSelectedPlan(plan); setStep('method'); }}
                    className={`relative p-8 rounded-[2.5rem] border-2 text-left transition-all ${
                      selectedPlan.id === plan.id ? 'border-primary bg-primary/5' : 'border-outline-variant bg-surface-container-low'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 right-8 px-4 py-1 bg-secondary text-on-secondary text-[10px] font-black uppercase rounded-full">Pi bon an</span>
                    )}
                    <h3 className="text-lg font-black text-primary">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-black text-primary">{plan.price} GDES</span>
                      <span className="text-xs text-outline font-bold">/ {plan.duration}</span>
                    </div>
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                          <CheckCircle2 size={14} className="text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'method' && (
            <motion.div 
              key="method"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-xl font-black text-primary">Chwazi fason w ap peye</h2>
                <p className="text-xs text-outline font-medium mt-2">Chwazi youn nan sèvis sa yo pou w voye kòb la</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { setPaymentMethod('MonCash'); setStep('form'); }}
                  className="p-8 bg-surface-container-low border border-outline-variant rounded-[2.5rem] flex flex-col items-center gap-4 hover:border-primary transition-all group"
                >
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Smartphone size={32} />
                  </div>
                  <span className="font-black text-sm uppercase">MonCash</span>
                </button>
                <button 
                  onClick={() => { setPaymentMethod('NatCash'); setStep('form'); }}
                  className="p-8 bg-surface-container-low border border-outline-variant rounded-[2.5rem] flex flex-col items-center gap-4 hover:border-primary transition-all group"
                >
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Smartphone size={32} />
                  </div>
                  <span className="font-black text-sm uppercase">NatCash</span>
                </button>
              </div>
              
              <button 
                onClick={() => setStep('plans')}
                className="w-full py-4 text-xs font-black text-outline uppercase tracking-widest"
              >
                Tounen dèyè
              </button>
            </motion.div>
          )}

          {step === 'form' && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  {paymentMethod === 'MonCash' ? <div className="w-10 h-10 bg-red-600 rounded-xl" /> : <div className="w-10 h-10 bg-blue-600 rounded-xl" />}
                  <h3 className="font-black text-lg text-primary">Enstriksyon {paymentMethod}</h3>
                </div>
                <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
                  Voye <span className="font-black text-primary">{selectedPlan.price} GDES</span> sou nimewo sa a:
                </p>
                <div className="mt-4 flex items-center justify-between p-4 bg-surface rounded-2xl border border-outline-variant">
                  <span className="text-xl font-black text-primary">{paymentMethod === 'MonCash' ? MONCASH_NUMBER : NATCASH_NUMBER}</span>
                  <button onClick={() => copyToClipboard(paymentMethod === 'MonCash' ? MONCASH_NUMBER : NATCASH_NUMBER)} className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                    <Copy size={20} />
                  </button>
                </div>
                <div className="mt-6 flex gap-3 p-4 bg-white/50 rounded-2xl text-[10px] font-bold text-outline uppercase italic">
                  <AlertCircle size={14} className="shrink-0" />
                  Kopi nimewo tranzaksyon an (Transaction ID) apre w fin voye kòb la pou w mete l anba a.
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-4">Nimewo Tranzaksyon</label>
                  <input 
                    type="text" 
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-6 py-4 bg-surface-container rounded-2xl border border-outline-variant focus:border-primary outline-none transition-all font-black text-sm uppercase tracking-widest"
                    placeholder="E.g. MC-12345678"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-error-container text-on-error-container rounded-2xl flex items-center gap-2 text-xs font-bold">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button 
                  onClick={handleApply}
                  disabled={loading || !transactionId}
                  className="w-full py-5 bg-primary text-on-primary font-black rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                  Soumèt Peman
                </button>
                
                <button 
                  onClick={() => setStep('method')}
                  className="w-full py-4 text-xs font-black text-outline uppercase tracking-widest"
                >
                  Chanje fason
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

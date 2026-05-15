import { Crown, Star, ShieldCheck, Zap, MessageCircle, Video, Lock, ExternalLink, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { UserStats } from '../types';

interface VIPViewProps {
  userStats: UserStats;
  onUpgrade: () => void;
}

export default function VIPView({ userStats, onUpgrade }: VIPViewProps) {
  const isVIP = userStats.isVIP;

  const exclusiveContent = [
    {
      title: "Masterclass: Scaling Ads to $10k/day",
      type: "Webinar",
      icon: <Video size={20} className="text-yellow-500" />,
      duration: "45 min",
      description: "Apprenez les techniques avancées de scaling que nous utilisons pour nos plus gros clients."
    },
    {
      title: "Modèles de Copies Haute Conversion",
      type: "Template",
      icon: <Award size={20} className="text-yellow-500" />,
      duration: "PDF",
      description: "Une bibliothèque de textes publicitaires qui ont généré plus de $1M de ventes."
    },
    {
      title: "Accès Direct au Groupe Privé",
      type: "Communauté",
      icon: <MessageCircle size={20} className="text-yellow-500" />,
      duration: "24/7",
      description: "Posez vos questions directement aux experts et échangez avec d'autres membres VIP."
    }
  ];

  if (!isVIP) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 h-[80vh] flex flex-col items-center justify-center text-center space-y-8"
      >
        <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-amber-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-yellow-500/20 rotate-12">
          <Crown size={48} className="text-white" />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-4xl font-black font-headline text-primary">Espace VIP Privé</h2>
          <p className="text-on-surface-variant max-w-sm mx-auto font-medium">
            Sèlman manm VIP ki gen aksè a zòn sa a. Debloke kontni eksklizif ak sipò priyorite kounye a.
          </p>
        </div>

        <div className="grid gap-4 w-full max-w-sm">
          {[
            { icon: <Zap size={18} />, text: "Leson Avanse & Masterclasses" },
            { icon: <ShieldCheck size={18} />, text: "Sipò Dirèk sou WhatsApp" },
            { icon: <Star size={18} />, text: "Modèl Piblisite ki vann" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
              <div className="text-yellow-600">{item.icon}</div>
              <span className="text-sm font-bold text-primary">{item.text}</span>
            </div>
          ))}
        </div>

        <motion.button 
          onClick={onUpgrade}
          whileHover={{ scale: 1.02, brightness: 1.1 }}
          whileTap={{ scale: 0.98 }}
          animate={{ 
            boxShadow: [
              "0 20px 25px -5px rgb(234 179 8 / 0.3), 0 8px 10px -6px rgb(234 179 8 / 0.3)",
              "0 20px 25px -5px rgb(234 179 8 / 0.5), 0 8px 10px -6px rgb(234 179 8 / 0.5)",
              "0 20px 25px -5px rgb(234 179 8 / 0.3), 0 8px 10px -6px rgb(234 179 8 / 0.3)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative w-full max-w-sm py-5 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-600 text-white font-black rounded-2xl shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 group overflow-hidden"
        >
          {/* Shimmer effect */}
          <motion.div 
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 translate-x-[-100%]"
          />
          <Crown size={24} className="relative z-10 group-hover:rotate-12 transition-transform" />
          <span className="relative z-10">VIN VIP KOUNYE A</span>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-4 space-y-8 pb-32"
    >
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary-container to-secondary p-8 text-on-primary shadow-2xl">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-yellow-500/20">
            <Crown size={12} fill="currentColor" />
            Manm VIP
          </div>
          <h2 className="text-4xl font-black font-headline leading-none">Byenvini nan<br />Zòn Rezève a</h2>
          <p className="opacity-80 text-sm font-medium">Ou gen tout privilèj yo debloke. Jwi yo!</p>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="font-black text-xs text-primary uppercase tracking-[0.2em] flex items-center gap-2">
          <Star size={14} className="text-yellow-500" fill="currentColor" />
          KONTNI EKSKLIZIF
        </h3>
        
        <div className="grid gap-4">
          {exclusiveContent.map((content, idx) => (
            <div key={idx} className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 hover:border-yellow-500/50 transition-all group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-2xl shrink-0 group-hover:scale-110 transition-transform">
                  {content.icon}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">{content.type}</span>
                    <span className="text-[10px] font-bold text-outline uppercase">{content.duration}</span>
                  </div>
                  <h4 className="text-lg font-bold text-primary group-hover:text-yellow-600 transition-colors">{content.title}</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{content.description}</p>
                </div>
                <div className="self-center">
                  <button className="p-2 bg-surface-container rounded-full text-outline group-hover:text-yellow-600 group-hover:bg-yellow-500/10 transition-all">
                    <ExternalLink size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-tr from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-[2.5rem] p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-green-500/20">
          <MessageCircle size={40} className="text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-green-700">Sipò Konseye</h3>
          <p className="text-sm text-green-800/70 font-medium">Bezwen èd ak yon kanpay? Kontakte nou kounye a sou WhatsApp.</p>
        </div>
        <a 
          href="https://wa.me/xxxxxx"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-green-500 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-green-500/30 hover:scale-105 transition-all active:scale-95"
        >
          <MessageCircle size={20} />
          PALE AK YON EKSPÈ
        </a>
      </section>
    </motion.div>
  );
}

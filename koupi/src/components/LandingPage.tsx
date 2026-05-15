import { motion } from 'motion/react';
import { 
  Menu, 
  Timer, 
  Package, 
  MousePointerClick, 
  CreditCard, 
  Gavel, 
  CheckCircle, 
  X as Cancel, 
  ChevronDown as ExpandMore,
  ArrowRight,
  Crown
} from 'lucide-react';
import { View } from '../types';

import { FAQS } from '../constants';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="bg-surface text-on-surface font-sans selection:bg-secondary/30 selection:text-secondary overflow-x-hidden">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-16 h-16 bg-primary text-on-primary border-b border-outline-variant/10 backdrop-blur-md bg-opacity-90">
        <h1 className="font-headline text-xl md:text-2xl font-bold">Levye Digital</h1>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-6">
            <a className="text-on-primary font-bold hover:bg-white/10 px-3 py-2 rounded-lg transition-all" href="#">Akèy</a>
            <a className="text-on-primary/80 hover:bg-white/10 px-3 py-2 rounded-lg transition-all" href="#">Fòmasyon</a>
            <a className="text-on-primary/80 hover:bg-white/10 px-3 py-2 rounded-lg transition-all" href="#">Plan</a>
          </nav>
          <button className="text-on-primary p-2 hover:bg-white/10 rounded-full transition-all">
            <Menu size={24} />
          </button>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex flex-col justify-center px-6 md:px-16 bg-primary text-on-primary overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              className="w-full h-full object-cover opacity-30 scale-105" 
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80"
              alt="Background"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent" />
          </div>
          <div className="relative z-10 max-w-4xl space-y-8">
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-7xl font-black font-headline leading-tight"
            >
              Mestriz lavant pwodui nimerik ak maketing dijital
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-2xl text-on-primary/90 max-w-2xl font-medium leading-relaxed"
            >
              Sèl fòmasyon w bezwen pou w lanse biznis ou sou entènèt nan 2024.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col md:flex-row gap-4"
            >
              <button 
                onClick={onStart}
                className="bg-secondary text-on-secondary font-black px-10 py-5 rounded-2xl hover:brightness-110 transition-all shadow-2xl shadow-secondary/20 flex items-center justify-center gap-2 group text-lg"
              >
                Kòmanse Kounye a
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="border-2 border-white/20 text-white font-black px-10 py-5 rounded-2xl hover:bg-white/10 transition-all text-lg">
                Wè sa w ap aprann
              </button>
            </motion.div>
          </div>
        </section>

        {/* Limited Offer Band */}
        <div className="bg-secondary text-on-secondary py-5 px-6 md:px-16 flex flex-col md:flex-row items-center justify-center gap-6 text-center border-y border-white/10">
          <div className="flex items-center gap-3 font-black uppercase tracking-widest text-sm">
            <Timer size={24} />
            Off limit! Li rete 48è sèlman.
          </div>
          <div className="flex items-center gap-6">
            <span className="line-through opacity-70 text-lg">25 USD</span>
            <span className="font-black text-3xl">15 USD</span>
            <span className="bg-on-secondary text-secondary px-3 py-1 rounded-xl text-xs font-black shadow-lg shadow-black/10">
              -40%
            </span>
          </div>
        </div>

        {/* Sa w ap aprann */}
        <section className="py-24 px-6 md:px-16 max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black font-headline text-primary">Sa w ap aprann</h2>
            <div className="w-24 h-1.5 bg-secondary mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: <Package size={28} />, 
                title: "Lavant pwodui nimerik", 
                desc: "Aprann kijan pou kreye ak vann pwodui nimerik san w pa bezwen gwo bidjè." 
              },
              { 
                icon: <MousePointerClick size={28} />, 
                title: "Piblisite Ads", 
                desc: "Mestrize algoritm yo pou w jwenn kliyan chak jou ak piblisite ki peye." 
              },
              { 
                icon: <CreditCard size={28} />, 
                title: "Kat debi vityèl", 
                desc: "Solisyon pratik pou w peye piblisite w ak resevwa lajan w depi Ayiti." 
              },
              { 
                icon: <Gavel size={28} />, 
                title: "Lwa lavant yo", 
                desc: "Psikoloji ki dèyè chak lavant ak kijan pou w konvenk nenpòt moun." 
              }
            ].map((card, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-white border border-outline-variant/30 p-8 rounded-[2.5rem] flex flex-col gap-6 hover:border-secondary/50 transition-all shadow-sm shadow-black/5"
              >
                <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-secondary">
                  {card.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-primary leading-tight">{card.title}</h3>
                  <p className="text-on-surface-variant font-medium text-sm leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-24 px-6 md:px-16 bg-surface-container-low/50">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-black font-headline text-primary">Chwazi plan pa w la</h2>
              <p className="text-on-surface-variant font-medium">Tout sa w bezwen pou w reyisi biznis nimerik ou.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
              {/* Plan 1 */}
              <div className="bg-white border border-outline-variant/30 p-10 rounded-[3rem] flex flex-col h-full space-y-10">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-outline">Debitan</span>
                  <h3 className="text-3xl font-black text-primary leading-tight">Gratis</h3>
                  <div className="text-4xl font-black text-primary pt-4">0 USD</div>
                </div>
                <ul className="space-y-4 flex-grow">
                  <li className="flex items-center gap-3 font-medium text-sm">
                    <CheckCircle className="text-secondary" size={20} /> Intro ak maketing
                  </li>
                  <li className="flex items-center gap-3 font-medium text-sm">
                    <CheckCircle className="text-secondary" size={20} /> Aksè kominote
                  </li>
                  <li className="flex items-center gap-3 font-medium text-sm opacity-40">
                    <Cancel size={20} /> Coaching prive
                  </li>
                </ul>
                <button 
                  onClick={onStart}
                  className="w-full py-5 border-2 border-primary text-primary font-black rounded-2xl hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5 uppercase tracking-widest text-xs"
                >
                  Kòmanse
                </button>
              </div>

              {/* Plan 2 Premium */}
              <div className="bg-white border-4 border-secondary p-10 rounded-[3.5rem] flex flex-col h-full relative transform md:scale-105 shadow-2xl shadow-secondary/20 space-y-10">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                  Pi Popilè
                </div>
                <div className="space-y-2 pt-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Akselerasyon</span>
                  <h3 className="text-3xl font-black text-primary leading-tight">Premium</h3>
                  <div className="text-4xl font-black text-secondary pt-4">
                    15 USD <span className="text-lg line-through text-outline font-black ml-2">25 USD</span>
                  </div>
                </div>
                <ul className="space-y-4 flex-grow">
                  <li className="flex items-center gap-3 font-bold text-sm">
                    <CheckCircle className="text-secondary" size={20} /> Tout modil kouran yo
                  </li>
                  <li className="flex items-center gap-3 font-bold text-sm">
                    <CheckCircle className="text-secondary" size={20} /> Tutorial kat vityèl
                  </li>
                  <li className="flex items-center gap-3 font-bold text-sm">
                    <CheckCircle className="text-secondary" size={20} /> Dokiman estrateji yo
                  </li>
                  <li className="flex items-center gap-3 font-bold text-sm">
                    <CheckCircle className="text-secondary" size={20} /> Sètifika fini
                  </li>
                </ul>
                <button 
                  onClick={onStart}
                  className="w-full py-6 bg-secondary text-on-secondary font-black rounded-2xl hover:brightness-110 shadow-2xl shadow-secondary/30 uppercase tracking-widest text-xs"
                >
                  Pran Aksè Premium
                </button>
              </div>

              {/* Plan 3 VIP */}
              <div className="bg-primary text-on-primary p-10 rounded-[3rem] flex flex-col h-full shadow-2xl space-y-10">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-primary/50">Ekstrèm</span>
                  <h3 className="text-3xl font-black text-white leading-tight">VIP Mastermind</h3>
                  <div className="text-4xl font-black text-white pt-4">99 USD</div>
                </div>
                <ul className="space-y-4 flex-grow">
                  <li className="flex items-center gap-3 font-bold text-sm">
                    <CheckCircle className="text-secondary" size={20} /> Coaching 1-on-1
                  </li>
                  <li className="flex items-center gap-3 font-bold text-sm">
                    <CheckCircle className="text-secondary" size={20} /> Aksè anyèl VIP
                  </li>
                  <li className="flex items-center gap-3 font-bold text-sm">
                    <CheckCircle className="text-secondary" size={20} /> Rankont an pèsòn
                  </li>
                </ul>
                <motion.button 
                  onClick={onStart}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-full py-5 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-black rounded-2xl shadow-xl shadow-yellow-500/20 uppercase tracking-widest text-xs overflow-hidden group"
                >
                  <motion.div 
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Crown size={14} />
                    Pran VIP Kounye a
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 px-6 md:px-16 max-w-3xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-black font-headline text-primary">Kesyon Poze</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((item, idx) => (
              <div key={idx} className="border border-outline-variant/30 rounded-3xl overflow-hidden shadow-sm shadow-black/5">
                <button className="w-full p-6 flex justify-between items-center text-left font-black text-primary hover:bg-surface-container transition-all group">
                  {item.q}
                  <ExpandMore size={24} className="text-outline group-hover:text-primary transition-colors" />
                </button>
                <div className="p-6 bg-white border-t border-outline-variant/30 text-on-surface-variant font-medium text-sm leading-relaxed">
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6 md:px-16 text-center bg-primary text-on-primary relative overflow-hidden">
          <div className="absolute inset-0 z-0">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-secondary/10 to-transparent" />
             <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-secondary/20 blur-[100px] rounded-full" />
             <div className="absolute -top-48 -right-48 w-96 h-96 bg-secondary/20 blur-[100px] rounded-full" />
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="relative z-10 max-w-4xl mx-auto space-y-12"
          >
            <h2 className="text-4xl md:text-7xl font-black font-headline leading-tight">Pare pou w chanje nivo nimerik ou?</h2>
            <p className="text-lg md:text-2xl opacity-80 font-medium max-w-2xl mx-auto">Pa kite chans sa pase. Antre nan kominote siksè nou an jodi a.</p>
            <button 
              onClick={onStart}
              className="bg-secondary text-on-secondary font-black text-xl md:text-2xl px-16 py-7 rounded-[2.5rem] shadow-2xl shadow-secondary/30 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Enskri jodi a
            </button>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full flex flex-col items-center gap-8 p-12 bg-primary text-on-primary/60 border-t border-white/5">
        <h2 className="text-xl font-bold font-headline text-white">Levye Digital</h2>
        <nav className="flex gap-8 text-sm font-bold">
          <a href="#" className="hover:text-white transition-colors">Kondisyon</a>
          <a href="#" className="hover:text-white transition-colors">Konfidansyalite</a>
          <a href="#" className="hover:text-white transition-colors">Kontak</a>
        </nav>
        <p className="text-[10px] uppercase font-black tracking-widest">© 2024 Levye Digital. Tout dwa rezève.</p>
      </footer>
    </div>
  );
}

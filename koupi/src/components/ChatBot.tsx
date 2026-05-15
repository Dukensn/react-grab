import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Loader2, Sparkles, User, Bot } from 'lucide-react';
import { getChatResponse, ChatMessage } from '../services/geminiService';

interface ChatBotProps {
  userStats: any;
  faqs: any[];
  courseModules: any[];
  isView?: boolean;
}

export default function ChatBot({ userStats, faqs, courseModules, isView }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(isView);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isView) setIsOpen(true);
  }, [isView]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const responseText = await getChatResponse(
        messages, 
        userMsg, 
        { userStats, faqs, courseModules }
      );
      setMessages([...newMessages, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([...newMessages, { 
        role: 'model', 
        text: "Mwen regrèt sa, mwen gen yon ti pwoblèm teknik kounye a. Tanpri tcheke koneksyon ou oswa eseye ankò pita." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const chatContent = (
    <motion.div
      initial={isView ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={isView ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
      className={`${isView ? 'w-full h-[calc(100vh-200px)]' : 'absolute bottom-16 right-0 w-[calc(100vw-32px)] sm:w-96 max-h-[70vh] sm:max-h-[600px] shadow-2xl border border-outline-variant rounded-[2rem]'} bg-surface overflow-hidden flex flex-col`}
    >
      {/* Header */}
      {!isView && (
        <div className="bg-primary p-4 flex items-center justify-between text-on-primary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center border border-white/10 ring-2 ring-secondary/20">
              <Sparkles size={20} className="text-secondary" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Levo - Asistan AI</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-medium opacity-70">Sipò ap kontinye</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container-low min-h-[300px] no-scrollbar"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
            <div className="p-4 bg-secondary/5 rounded-full text-secondary">
              <MessageSquare size={32} />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">Bonjou, mwen se Levo!</p>
              <p className="text-xs text-on-surface-variant font-medium mt-1">Kijan m ka ede w ak fòmasyon an oswa peman yo jodi a?</p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full pt-4">
              {[
                "Kijan pou m peye ak MonCash?",
                "Ki diferans ant Gratis ak Premium?",
                "Èske m ap jwenn yon sètifika?"
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(suggestion);
                  }}
                  className="text-[10px] font-bold text-secondary bg-secondary/5 border border-secondary/10 px-4 py-2.5 rounded-xl hover:bg-secondary/10 transition-colors text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${
              msg.role === 'user' ? 'bg-primary text-on-primary' : 'bg-secondary text-on-secondary'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`p-3.5 rounded-2xl text-sm leading-relaxed max-w-[85%] shadow-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-on-primary rounded-tr-none' 
                : 'bg-white text-on-surface border border-outline-variant/30 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl shrink-0 bg-secondary text-on-secondary flex items-center justify-center">
              <Loader2 size={16} className="animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-outline-variant/30 rounded-tl-none flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-surface border-t border-outline-variant">
        <div className="relative group">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ekri mesaj ou isit la..."
            className="w-full bg-surface-container-low border border-outline-variant/50 rounded-2xl py-4 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm font-medium"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-secondary text-on-secondary shadow-lg disabled:opacity-50 disabled:shadow-none hover:brightness-110 active:scale-95 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );

  if (isView) {
    return (
      <div className="px-4 max-w-2xl mx-auto py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-black font-headline text-primary flex items-center gap-3">
            <Sparkles className="text-secondary" />
            Asistan Levo
          </h2>
          <p className="text-sm text-on-surface-variant font-medium mt-1">
            Poze nenpòt kesyon sou kou a, platfòm la, oswa peman yo.
          </p>
        </div>
        {chatContent}
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 z-[100] lg:bottom-8 lg:right-8">
      <AnimatePresence>
        {isOpen && chatContent}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-secondary text-on-secondary shadow-2xl flex items-center justify-center hover:brightness-110 transition-all group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="flex items-center justify-center p-0"
            >
              <Sparkles size={24} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Badge reminder */}
        {!isOpen && messages.length === 0 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center shadow-md shadow-orange-500/20"
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </motion.div>
        )}
      </motion.button>
    </div>
  );
}

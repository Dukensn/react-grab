import { FileText, Link as LinkIcon, Video, Search, ChevronRight, Download, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Lesson, Resource } from '../types';

interface ResourcesViewProps {
  lessons: Lesson[];
  onOpenLesson: (id: number) => void;
}

export default function ResourcesView({ lessons, onOpenLesson }: ResourcesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all resources from all lessons
  const allResources = lessons.flatMap(lesson => 
    (lesson.resources || []).map(res => ({
      ...res,
      lessonTitle: lesson.title,
      lessonId: lesson.id
    }))
  );

  const filteredResources = allResources.filter(res => 
    res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText size={20} className="text-red-500" />;
      case 'video': return <Video size={20} className="text-secondary" />;
      default: return <LinkIcon size={20} className="text-blue-500" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-4 space-y-8"
    >
      <header className="space-y-2">
        <h2 className="text-3xl font-black font-headline text-primary">Resous yo</h2>
        <p className="text-on-surface-variant text-sm font-medium">Tout dokiman, lyen, ak videyo siplemantè yo yon sèl kote.</p>
      </header>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors" size={20} />
        <input 
          type="text"
          placeholder="Chèche yon resous..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant/50 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm font-medium"
        />
      </div>

      <div className="grid gap-4">
        {filteredResources.length > 0 ? (
          filteredResources.map((res, idx) => (
            <motion.div 
              key={`${res.id}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-5 hover:border-secondary/50 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-surface-container rounded-2xl shrink-0 group-hover:scale-110 transition-transform">
                  {getIcon(res.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest">{res.type}</span>
                    <span className="w-1 h-1 bg-outline/20 rounded-full" />
                    <button 
                      onClick={() => onOpenLesson(res.lessonId)}
                      className="text-[10px] font-bold text-outline hover:text-secondary truncate max-w-[150px]"
                    >
                      Leson: {res.lessonTitle}
                    </button>
                  </div>
                  <h3 className="font-bold text-primary mb-3 leading-tight underline-offset-4 decoration-secondary/30 decoration-2">
                    {res.title}
                  </h3>
                  <div className="flex items-center gap-3">
                    <a 
                      href={res.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary rounded-xl font-bold text-xs shadow-lg shadow-secondary/20 hover:brightness-110 transition-all active:scale-95"
                    >
                      {res.type === 'pdf' ? <Download size={14} /> : <ExternalLink size={14} />}
                      {res.type === 'pdf' ? 'Telechaje' : 'Ouvè lyen'}
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center text-outline opacity-20">
              <FileText size={40} />
            </div>
            <p className="text-on-surface-variant font-medium italic">Nou pa jwenn okenn resous pou rechèch sa.</p>
          </div>
        )}
      </div>

      <div className="h-20" /> {/* Spacer for navigation */}
    </motion.div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../layout/Sidebar';

const BrandlineLogo = ({ height = 36 }) => (
  <img src="/Logo.svg" alt="Brandline AI Logo" style={{ height }} className="w-auto block" />
);

export default function EstimatorLoader({ messages, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 1;
      setProgress(currentProgress);
      
      // Update status messages periodically
      if (currentProgress % 14 === 0 && statusIndex < messages.length - 1) {
        setStatusIndex(prev => prev + 1);
      }
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => onComplete(), 500);
      }
    }, 28); // ~3 seconds total

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[70vh] flex flex-col items-center justify-center max-w-2xl mx-auto overflow-hidden">
      <div className="mb-12">
        <div className="relative">
          <div className="absolute -inset-4 bg-brand-primary/20 blur-2xl rounded-full animate-pulse" />
          <BrandlineLogo height={42} />
        </div>
      </div>

      <div className="relative w-56 h-56 mb-12">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="112" cy="112" r="100" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          <circle
            cx="112" cy="112" r="100" fill="transparent" stroke="#038D46" strokeWidth="10"
            strokeDasharray={628.3}
            strokeDashoffset={628.3 - (628.3 * progress) / 100}
            strokeLinecap="round"
            className="transition-all duration-300 ease-linear shadow-[0_0_15px_rgba(3,141,70,0.5)]"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-black text-brand-text leading-none">{progress}</span>
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest mt-2">Percent</span>
        </div>
      </div>

      <div className="w-full space-y-3 px-10">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, idx) => {
            if (idx !== statusIndex) return null;
            return (
              <motion.div 
                key={msg}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center text-center"
              >
                <p className="text-lg font-bold text-brand-text">{msg}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div className="flex justify-center gap-1.5">
          {messages.map((_, i) => (
            <div key={i} className={cn("h-1.5 rounded-full transition-all duration-500", i === statusIndex ? "w-8 bg-brand-primary" : "w-1.5 bg-brand-border")} />
          ))}
        </div>
      </div>
    </div>
  );
}

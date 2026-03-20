import { useState } from 'react';
import { Sparkles, X, Send, Bot } from 'lucide-react';
import { cn } from '../layout/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIFloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi Admin! I can help you track jobs, generate quotes, or review client history. What do you need?' },
    { role: 'user', text: 'What is the status of the Shan Foods exhibition stall?' },
    { role: 'ai', text: 'Job BL-2026-047 (Shan Foods Exhibition Stall) is currently in Production. The deadline is Mar 25, 2026. It is assigned to Design Team A.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setIsTyping(true);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: "I'm a simulated AI assistant for this demo. I can't fetch real data right now, but I'm ready to help when fully integrated!" }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-lg hover:bg-brand-primary-hover hover:scale-105 transition-all z-40",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <Sparkles size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[380px] h-[580px] bg-brand-card border border-brand-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-brand-bg border-b border-brand-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                  <Bot size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-brand-text text-sm">Brandline AI Assistant</h3>
                    <span className="text-[10px] bg-brand-primary/20 text-brand-primary px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Beta</span>
                  </div>
                  <p className="text-xs text-brand-text-muted">Ask me anything about your jobs, clients, or quotes</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-brand-text-muted hover:text-brand-text p-1">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    msg.role === 'user' 
                      ? "bg-brand-primary text-white rounded-tr-sm" 
                      : "bg-brand-bg border border-brand-border text-brand-text rounded-tl-sm"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-brand-bg border border-brand-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-brand-text-muted rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-brand-text-muted rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-brand-text-muted rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-brand-bg border-t border-brand-border">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Brandline AI..." 
                  className="w-full bg-brand-card border border-brand-border rounded-full pl-4 pr-12 py-3 text-sm text-brand-text focus:outline-none focus:border-brand-primary placeholder:text-brand-text-muted/70"
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 p-2 rounded-full text-brand-primary hover:bg-brand-primary/10 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
              <div className="mt-3 text-center">
                <span className="text-[10px] text-brand-text-muted uppercase tracking-wider font-medium flex items-center justify-center gap-1">
                  <Sparkles size={10} /> Powered by Brandline AI
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

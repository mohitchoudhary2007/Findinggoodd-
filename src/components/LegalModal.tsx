import React from 'react';
import { X, Shield, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  type: 'privacy' | 'terms';
}

export default function LegalModal({ isOpen, onClose, title, content, type }: LegalModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl max-h-[80vh] bg-surface border border-border rounded-3xl overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-8 border-b border-border flex justify-between items-center bg-foreground/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center">
                  {type === 'privacy' ? <Shield className="text-brand-primary" /> : <FileText className="text-brand-primary" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-display text-foreground">{title}</h2>
                  <p className="text-sm text-foreground/40">Last Updated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide text-foreground">
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-foreground/70 font-sans">
                {content || "No content has been added to this section yet. Check back soon."}
              </div>
            </div>
            
            <div className="p-6 border-t border-border bg-foreground/5 text-center">
              <button 
                onClick={onClose}
                className="bg-brand-primary hover:bg-brand-primary/80 text-white font-bold py-3 px-12 rounded-xl transition-all active:scale-95 shadow-lg shadow-brand-primary/20"
              >
                Close View
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

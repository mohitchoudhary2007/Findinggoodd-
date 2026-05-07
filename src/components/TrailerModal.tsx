import React, { useState, useEffect } from 'react';
import { X, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TrailerModalProps {
  url: string | null;
  onClose: () => void;
}

export default function TrailerModal({ url, onClose }: TrailerModalProps) {
  const [showAd, setShowAd] = useState(true);
  const [adTimer, setAdTimer] = useState(5);

  useEffect(() => {
    if (!url) return;
    setShowAd(true);
    setAdTimer(5);
    
    const interval = setInterval(() => {
      setAdTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [url]);

  // Convert YouTube normal URL to embed URL if needed
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
  };

  if (!url) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/95 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5"
        >
          {showAd ? (
            <div className="absolute inset-0 z-10 bg-background flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Play fill="currentColor" className="text-brand-primary" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent mb-2">
                Loading Preview Experience
              </h3>
              <p className="text-foreground/40 max-w-md">
                Trailer will start shortly. This message is brought to you by Findinggoodd.
              </p>
              
              <div className="mt-12 flex flex-col items-center gap-4">
                <div className="w-48 h-1 bg-foreground/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="h-full bg-brand-primary"
                  />
                </div>
                
                <button
                  disabled={adTimer > 0}
                  onClick={() => setShowAd(false)}
                  className="bg-foreground/10 hover:bg-foreground/20 disabled:opacity-50 text-foreground px-8 py-3 rounded-full text-sm font-bold border border-border transition-all"
                >
                  {adTimer > 0 ? `Skip in ${adTimer}s` : "Skip Ad"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-colors"
              >
                <X size={20} />
              </button>
              <iframe
                src={`${getEmbedUrl(url)}?autoplay=1&rel=0`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

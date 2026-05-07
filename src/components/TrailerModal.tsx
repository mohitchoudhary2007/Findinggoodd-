import React, { useState, useEffect } from 'react';
import { X, Play, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { Ad } from '@/src/types';

interface TrailerModalProps {
  url: string | null;
  onClose: () => void;
}

export default function TrailerModal({ url, onClose }: TrailerModalProps) {
  const [showAd, setShowAd] = useState(true);
  const [adTimer, setAdTimer] = useState(5);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);

  useEffect(() => {
    if (!url) return;
    setShowAd(true);
    setAdTimer(5);
    
    // Fetch a random active ad
    const fetchRandomAd = async () => {
      try {
        const q = query(
          collection(db, 'ads'), 
          where('isActive', '==', true), 
          where('type', '==', 'trailer'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const adsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
          const randomAd = adsList[Math.floor(Math.random() * adsList.length)];
          setCurrentAd(randomAd);
        }
      } catch (err) {
        // Fallback silently if ads fail to load
        console.error("Ad failed to load", err);
      }
    };
    fetchRandomAd();
    
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
            <div className="absolute inset-0 z-10 bg-background flex flex-col md:flex-row items-center justify-center gap-8 p-12 overflow-hidden">
              {/* Ad Image Container */}
              <div className="flex-1 w-full h-full relative group">
                {currentAd ? (
                  <a 
                    href={currentAd.targetUrl || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full h-full rounded-2xl overflow-hidden relative"
                  >
                    <img 
                      src={currentAd.imageUrl} 
                      className="w-full h-full object-cover" 
                      alt="Advertisement"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                    {currentAd.targetUrl && (
                      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        Visit Sponsor <ExternalLink size={12} />
                      </div>
                    )}
                  </a>
                ) : (
                  <div className="w-full h-full bg-foreground/5 rounded-2xl flex flex-col items-center justify-center gap-4">
                    <Play className="text-brand-primary/20" size={64} />
                    <p className="text-foreground/10 font-bold uppercase tracking-widest text-xs">Loading Experience</p>
                  </div>
                )}
              </div>

              {/* Countdown Side */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6 max-w-sm">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent mb-2">
                    Coming Up Next
                  </h3>
                  <p className="text-foreground/40 text-sm leading-relaxed">
                    Bringing you the best previews daily. Enjoy this message from our sponsors while you wait.
                  </p>
                </div>
                
                <div className="w-full flex flex-col items-center md:items-start gap-4">
                  <div className="w-full h-1 bg-foreground/10 rounded-full overflow-hidden">
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
                    className="w-full bg-foreground/10 hover:bg-foreground/20 disabled:opacity-50 text-foreground px-8 py-3 rounded-xl text-sm font-bold border border-border transition-all active:scale-95"
                  >
                    {adTimer > 0 ? `Skip in ${adTimer}s` : "Proceed to Trailer"}
                  </button>
                </div>
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

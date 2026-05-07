import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Ad } from '@/src/types';

interface DownloadModalProps {
  movieName: string;
  targetUrl: string | null;
  onClose: () => void;
}

export default function DownloadModal({ movieName, targetUrl, onClose }: DownloadModalProps) {
  const [adTimer, setAdTimer] = useState(10);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!targetUrl) return;

    // Fetch a random active ad
    const fetchRandomAd = async () => {
      try {
        const q = query(collection(db, 'ads'), where('isActive', '==', true), limit(10));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const adsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
          const randomAd = adsList[Math.floor(Math.random() * adsList.length)];
          setCurrentAd(randomAd);
        }
      } catch (err) {
        console.error("Ad failed to load", err);
      }
    };
    fetchRandomAd();

    const interval = setInterval(() => {
      setAdTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsReady(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetUrl]);

  if (!targetUrl) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl bg-surface border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 w-12 h-12 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col lg:flex-row h-full">
          {/* Ad Section */}
          <div className="flex-1 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/5 bg-gradient-to-br from-brand-primary/5 to-transparent">
            {currentAd ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-brand-primary mb-4">
                  <ShieldCheck size={20} />
                  <span className="text-xs font-black uppercase tracking-widest">Verified Sponsor Content</span>
                </div>
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative group">
                  <img 
                    src={currentAd.imageUrl} 
                    className="w-full h-full object-cover" 
                    alt="Sponsor Ad" 
                    referrerPolicy="no-referrer"
                  />
                  {currentAd.targetUrl && (
                    <a 
                      href={currentAd.targetUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        Visit Sponsor <ExternalLink size={18} />
                      </div>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="aspect-[4/3] rounded-3xl bg-white/5 flex flex-col items-center justify-center gap-4 animate-pulse">
                <Download size={48} className="text-brand-primary/20" />
                <p className="text-white/10 font-bold uppercase tracking-widest text-xs">Securing Connection</p>
              </div>
            )}
          </div>

          {/* Action Section */}
          <div className="w-full lg:w-[400px] p-8 lg:p-12 flex flex-col justify-center text-center lg:text-left">
            <h2 className="text-3xl font-black font-display mb-2 truncate">{movieName}</h2>
            <p className="text-white/40 text-sm mb-8 leading-relaxed">
              Your high-quality file is almost ready. Please support our sponsors to continue keeping Findinggoodd free for everyone.
            </p>

            <div className="space-y-6">
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      className="text-white/10"
                    />
                    <motion.circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray={175.92}
                      initial={{ strokeDashoffset: 175.92 }}
                      animate={{ strokeDashoffset: (adTimer / 10) * 175.92 }}
                      className="text-brand-primary"
                    />
                  </svg>
                  <span className="absolute text-xl font-black">{adTimer}</span>
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Status</p>
                  <p className="font-bold text-sm">
                    {adTimer > 0 ? 'Generating Secure Link...' : 'Link Fully Generated'}
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <AnimatePresence mode="wait">
                  {isReady ? (
                    <motion.a
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-brand-primary hover:bg-brand-primary/80 text-white font-black py-5 rounded-2xl text-center shadow-xl shadow-brand-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      <Download size={20} />
                      Download Now
                    </motion.a>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full bg-white/5 border border-white/10 text-white/40 py-5 rounded-2xl text-center font-bold"
                    >
                      Please wait {adTimer}s
                    </motion.div>
                  )}
                </AnimatePresence>
                <p className="text-[10px] text-white/20 mt-4 text-center">
                  By clicking, you agree to our Terms of Service
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

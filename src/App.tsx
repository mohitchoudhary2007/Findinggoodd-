/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, query, orderBy, onSnapshot, doc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { Movie, AppConfig } from '@/src/types';
import { Loader2, MessageCircle, Film } from 'lucide-react';

// Components
import BackgroundDecoration from '@/src/components/BackgroundDecoration';
import SearchBar from '@/src/components/SearchBar';
import TrendingBanner from '@/src/components/TrendingBanner';
import MovieCard from '@/src/components/MovieCard';
import FeedbackModal from '@/src/components/FeedbackModal';
import TrailerModal from '@/src/components/TrailerModal';
import DownloadModal from '@/src/components/DownloadModal';
import LegalModal from '@/src/components/LegalModal';
import Footer from '@/src/components/Footer';
import AdminPanel from '@/src/components/AdminPanel';
import ThemeToggle from '@/src/components/ThemeToggle';

export default function App() {
  const [isAdminView, setIsAdminView] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [secretCounter, setSecretCounter] = useState(0);
  
  // Modals state
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [downloadInfo, setDownloadInfo] = useState<{ name: string, url: string } | null>(null);
  const [legalType, setLegalType] = useState<'privacy' | 'terms' | null>(null);

  useEffect(() => {
    // Initial fetch
    const q = query(collection(db, 'movies'), orderBy('createdAt', 'desc'));
    const unsubMovies = onSnapshot(q, (snapshot) => {
      setMovies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movie)));
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'movies');
    });

    const unsubConfig = onSnapshot(doc(db, 'config', 'app'), (snapshot) => {
      if (snapshot.exists()) {
        setConfig(snapshot.data() as AppConfig);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'config/app');
    });

    return () => {
      unsubMovies();
      unsubConfig();
    };
  }, []);

  const filteredMovies = useMemo(() => {
    if (!searchQuery) return movies;
    const lower = searchQuery.toLowerCase();
    return movies.filter(m => m.name.toLowerCase().includes(lower));
  }, [movies, searchQuery]);

  if (isAdminView) {
    return (
      <div className="min-h-screen bg-background">
        <ThemeToggle />
        <button 
          onClick={() => setIsAdminView(false)}
          className="fixed bottom-8 right-8 z-[110] bg-brand-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 font-bold"
        >
          <Film size={20} />
          Exit Admin
        </button>
        <AdminPanel />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-background text-foreground">
      <ThemeToggle />
      <BackgroundDecoration />

      <header className="pt-12 pb-20 px-6">
        <nav className="max-w-7xl mx-auto flex justify-between items-center mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => {
              setSecretCounter(prev => {
                if (prev + 1 >= 5) {
                  setIsAdminView(true);
                  return 0;
                }
                return prev + 1;
              });
            }}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/30 group-hover:rotate-12 transition-transform animate-pulse">
              <Film className="text-white" size={24} />
            </div>
            <div className="relative overflow-hidden px-2 py-1">
              <h1 className="text-3xl font-black font-display tracking-tightest select-none bg-clip-text text-transparent bg-gradient-to-r from-foreground via-brand-primary to-foreground bg-[length:200%_auto] animate-shine">
                {config?.siteName || 'Findinggoodd'}
              </h1>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setIsFeedbackOpen(true)}
            className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2 group"
          >
            <MessageCircle size={18} className="text-brand-primary group-hover:scale-125 transition-transform" />
            <span className="font-bold text-sm tracking-wide">Request Movie</span>
          </motion.button>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-16 px-4"
        >
          <h2 className="text-5xl md:text-8xl font-black font-display mb-8 tracking-tighter leading-[0.9] drop-shadow-2xl">
            DISCOVER YOUR <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary bg-[length:200%_auto] animate-gradient-x bg-clip-text text-transparent">NEXT STORY</span>
          </h2>
          <p className="text-foreground/50 text-base md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            High definition downloads, lightning speed, zero compromise. <br className="hidden md:block" />
            The ultimate companion for every cinephile.
          </p>
        </motion.div>

        <SearchBar onSearch={setSearchQuery} />
      </header>

      <TrendingBanner trendingTitles={config?.trendingMovies || []} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 mb-24">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-50">
            <Loader2 className="animate-spin" size={48} />
            <p className="font-display font-medium tracking-widest uppercase text-xs">Synchronizing Database</p>
          </div>
        ) : filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredMovies.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  onWatchTrailer={setTrailerUrl}
                  onDownload={(name, url) => setDownloadInfo({ name, url })}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-2xl font-bold font-display text-white/20">No movies found matching "{searchQuery}"</p>
          </div>
        )}
      </main>

      <Footer onLegalClick={(type) => setLegalType(type)} config={config} />

      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
      
      <TrailerModal 
        url={trailerUrl} 
        onClose={() => setTrailerUrl(null)} 
      />

      <DownloadModal
        movieName={downloadInfo?.name || ''}
        targetUrl={downloadInfo?.url || null}
        onClose={() => setDownloadInfo(null)}
      />

      <LegalModal 
        isOpen={!!legalType}
        type={legalType === 'privacy' ? 'privacy' : 'terms'}
        onClose={() => setLegalType(null)}
        title={legalType === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
        content={legalType === 'privacy' ? config?.privacyPolicy || '' : config?.termsOfService || ''}
      />
    </div>
  );
}

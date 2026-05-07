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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
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

  const paginatedMovies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMovies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMovies, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

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
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-background text-foreground transform-gpu">
      <ThemeToggle />
      <BackgroundDecoration />

      <header className="pt-20 pb-6 px-4 md:px-6">
        <nav className="max-w-7xl mx-auto flex justify-between items-center mb-16 md:mb-24 relative z-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 group"
          >
            <div 
              onClick={() => {
                setSecretCounter(prev => {
                  if (prev + 1 >= 5) {
                    setIsAdminView(true);
                    return 0;
                  }
                  return prev + 1;
                });
              }}
              className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-brand-primary/30 group-hover:rotate-12 transition-transform animate-pulse will-change-transform transform-gpu cursor-pointer"
            >
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
            className="px-6 py-3 rounded-2xl bg-foreground/5 border border-border hover:bg-foreground/10 transition-all flex items-center gap-2 group"
          >
            <MessageCircle size={18} className="text-brand-primary group-hover:scale-125 transition-transform" />
            <span className="font-bold text-sm tracking-wide">Request Movie</span>
          </motion.button>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-24 px-4 relative z-10"
        >
          <motion.h2 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black font-display mb-6 md:mb-8 tracking-tighter leading-[1] md:leading-[0.9] drop-shadow-2xl will-change-transform transform-gpu"
          >
            DISCOVER YOUR <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x inline-block">NEXT STORY</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-foreground/50 text-base md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
          >
            High definition downloads, lightning speed, zero compromise. <br className="hidden md:block" />
            The ultimate companion for every cinephile.
          </motion.p>
        </motion.div>

        <SearchBar onSearch={handleSearch} />
      </header>

      <TrendingBanner trendingTitles={config?.trendingMovies || []} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 mb-40">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-50">
            <Loader2 className="animate-spin" size={48} />
            <p className="font-display font-medium tracking-widest uppercase text-xs">Synchronizing Database</p>
          </div>
        ) : paginatedMovies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              <AnimatePresence mode="popLayout">
                {paginatedMovies.map((movie) => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    onWatchTrailer={setTrailerUrl}
                    onDownload={(name, url) => setDownloadInfo({ name, url })}
                  />
                ))}
              </AnimatePresence>
            </div>

            {totalPages > 1 && (
              <div className="mt-20 flex justify-center items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage(prev => Math.max(1, prev - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-2xl bg-foreground/5 border border-border hover:bg-foreground/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all font-bold text-xs uppercase tracking-widest"
                >
                  Prev
                </button>
                
                <div className="flex flex-wrap justify-center gap-1 max-w-[200px] sm:max-w-none">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentPage(i + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${
                        currentPage === i + 1 
                          ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30' 
                          : 'bg-foreground/5 text-foreground/40 hover:bg-foreground/10'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-2xl bg-foreground/5 border border-border hover:bg-foreground/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all font-bold text-xs uppercase tracking-widest"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center">
            <p className="text-2xl font-bold font-display text-foreground/20">No movies found matching "{searchQuery}"</p>
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
        duration={config?.trailerAdDuration || 5}
        onClose={() => setTrailerUrl(null)} 
      />

      <DownloadModal
        movieName={downloadInfo?.name || ''}
        targetUrl={downloadInfo?.url || null}
        duration={config?.downloadAdDuration || 10}
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

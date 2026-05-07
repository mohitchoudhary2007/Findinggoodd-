import React from 'react';
import { Play, Download, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { Movie } from '@/src/types';

interface MovieCardProps {
  movie: Movie;
  onWatchTrailer: (url: string) => void;
  onDownload: (name: string, url: string) => void;
}

export default function MovieCard({ movie, onWatchTrailer, onDownload }: MovieCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="group relative aspect-[2/3] rounded-2xl overflow-hidden glass-panel hover:shadow-2xl hover:shadow-brand-primary/20 transition-shadow duration-300"
    >
      <img
        src={movie.posterUrl}
        alt={movie.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        referrerPolicy="no-referrer"
      />
      
      <div className="absolute inset-0 movie-card-gradient opacity-80 group-hover:opacity-100 transition-opacity" />
      
      <div className="absolute inset-0 p-3 md:p-5 flex flex-col justify-end md:transform md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-sm md:text-xl font-bold font-display mb-1 md:mb-2 drop-shadow-lg leading-tight line-clamp-2">{movie.name}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-2">
          <button
            onClick={() => onWatchTrailer(movie.trailerUrl)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white py-1.5 md:py-2 px-2 md:px-4 rounded-lg md:rounded-xl flex items-center justify-center gap-1.5 md:gap-2 transition-all active:scale-95"
          >
            <Play size={14} fill="currentColor" className="md:w-[18px] md:h-[18px]" />
            <span className="font-semibold text-[10px] md:text-sm uppercase md:capitalize tracking-wider md:tracking-normal">Trailer</span>
          </button>
          
          <button
            onClick={() => onDownload(movie.name, movie.downloadUrl)}
            className="bg-brand-primary hover:bg-brand-primary/80 text-white py-1.5 md:py-2 px-2 md:px-4 rounded-lg md:rounded-xl flex items-center justify-center gap-1.5 md:gap-2 transition-all active:scale-95 shadow-lg shadow-brand-primary/20"
          >
            <Download size={14} className="md:w-[18px] md:h-[18px]" />
            <span className="font-semibold text-[10px] md:text-sm uppercase md:capitalize tracking-wider md:tracking-normal">Download</span>
          </button>
        </div>
      </div>
      
      {movie.isTrending && (
        <div className="absolute top-4 right-4 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
          Trending
        </div>
      )}
    </motion.div>
  );
}

import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <div className="relative max-w-2xl mx-auto px-4 w-full group">
      <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none text-foreground/40 group-focus-within:text-brand-primary transition-colors">
        <Search size={20} />
      </div>
      <input
        type="text"
        placeholder="Search movies, series, titles..."
        className="w-full bg-foreground/5 border border-border rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all text-lg placeholder:text-foreground/30 text-foreground"
        onChange={(e) => onSearch(e.target.value)}
      />
      <motion.div
        initial={false}
        className="absolute inset-0 bg-brand-primary/5 -z-10 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"
      />
    </div>
  );
}

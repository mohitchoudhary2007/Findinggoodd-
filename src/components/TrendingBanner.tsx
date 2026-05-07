import React from 'react';
import { motion } from 'motion/react';

interface TrendingBannerProps {
  trendingTitles: string[];
}

export default function TrendingBanner({ trendingTitles }: TrendingBannerProps) {
  if (!trendingTitles.length) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 mb-8 md:mb-16">
      <div className="relative group overflow-hidden rounded-2xl glass-panel border border-border shadow-xl shadow-brand-primary/5 transition-colors duration-500">
        {/* Animated Light Sweep Effect */}
        <div 
          className="absolute top-0 bottom-0 w-48 bg-gradient-to-r from-transparent via-brand-primary/10 to-transparent pointer-events-none animate-sweep-slow"
        />

        <div className="relative z-10 flex items-center h-10">
          <div className="flex items-center gap-2 px-5 border-r border-border shrink-0 bg-brand-primary/5 h-full">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-brand-primary animate-ping absolute inset-0 opacity-75" />
              <div className="w-2 h-2 rounded-full bg-brand-primary relative shadow-[0_0_10px_rgba(255,61,0,0.5)]" />
            </div>
            <span className="text-[10px] font-black text-foreground uppercase tracking-tighter drop-shadow-sm">
              Trending
            </span>
          </div>
          
          <div className="flex-1 overflow-hidden pointer-events-none">
            <div className="flex items-center gap-8 animate-marquee will-change-transform transform-gpu">
              <div className="flex gap-16 items-center whitespace-nowrap">
                {trendingTitles.concat(trendingTitles).concat(trendingTitles).map((title, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="text-[10px] font-bold text-foreground/80 uppercase tracking-wide flex items-center gap-6 will-change-opacity"
                  >
                    <span className="hover:text-brand-primary transition-colors">{title}</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-brand-primary" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Inner Border Glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent p-px" />
      </div>
    </div>
  );
}

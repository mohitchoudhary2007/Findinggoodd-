import React from 'react';
import { motion } from 'motion/react';

interface TrendingBannerProps {
  trendingTitles: string[];
}

export default function TrendingBanner({ trendingTitles }: TrendingBannerProps) {
  if (!trendingTitles.length) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 mb-12">
      <div className="relative group overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 glass-panel shadow-2xl shadow-brand-primary/10">
        {/* Animated Light Sweep Effect */}
        <motion.div 
          animate={{
            left: ['-100%', '200%'],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 2
          }}
          className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[35deg] pointer-events-none"
        />

        <div className="relative z-10 flex items-center h-14">
          <div className="flex items-center gap-3 px-8 border-r border-white/10 shrink-0 bg-white/[0.02] h-full">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-ping absolute inset-0 opacity-75" />
              <div className="w-2.5 h-2.5 rounded-full bg-brand-primary relative" />
            </div>
            <span className="text-sm font-black text-white uppercase tracking-tighter">
              Trending
            </span>
          </div>
          
          <div className="flex-1 overflow-hidden pointer-events-none">
            <div className="flex items-center gap-12 animate-marquee py-2">
              <div className="flex gap-20 items-center whitespace-nowrap">
                {trendingTitles.concat(trendingTitles).concat(trendingTitles).map((title, i) => (
                  <div
                    key={i}
                    className="text-sm font-bold text-white/50 uppercase tracking-tight flex items-center gap-8"
                  >
                    <span>{title}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                  </div>
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

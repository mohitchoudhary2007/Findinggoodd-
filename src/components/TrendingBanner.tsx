import React from 'react';
import { motion } from 'motion/react';

interface TrendingBannerProps {
  trendingTitles: string[];
}

export default function TrendingBanner({ trendingTitles }: TrendingBannerProps) {
  if (!trendingTitles.length) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 mb-24">
      <div className="relative group overflow-hidden rounded-2xl bg-white/[0.03] border border-white/10 glass-panel shadow-2xl shadow-brand-primary/10">
        {/* Animated Light Sweep Effect */}
        <motion.div 
          animate={{
            left: ['-100%', '300%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 1
          }}
          className="absolute top-0 bottom-0 w-48 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[35deg] pointer-events-none"
        />

        <div className="relative z-10 flex items-center h-10">
          <div className="flex items-center gap-2 px-5 border-r border-white/10 shrink-0 bg-white/[0.05] h-full">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-brand-primary animate-ping absolute inset-0 opacity-75" />
              <div className="w-2 h-2 rounded-full bg-brand-primary relative shadow-[0_0_10px_rgba(255,61,0,0.5)]" />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-tighter drop-shadow-md">
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
                      opacity: [0.3, 0.6, 0.3],
                      scale: [0.98, 1, 0.98]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="text-[10px] font-bold text-white uppercase tracking-wide flex items-center gap-6 will-change-transform transform-gpu"
                  >
                    <span>{title}</span>
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

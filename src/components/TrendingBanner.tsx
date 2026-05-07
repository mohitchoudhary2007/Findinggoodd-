import React from 'react';
import { motion } from 'motion/react';

interface TrendingBannerProps {
  trendingTitles: string[];
}

export default function TrendingBanner({ trendingTitles }: TrendingBannerProps) {
  if (!trendingTitles.length) return null;

  return (
    <div className="w-full overflow-hidden whitespace-nowrap py-3 bg-white/5 border-y border-white/5 mb-8">
      <div className="flex items-center gap-4 animate-marquee">
        <span className="text-xs font-bold text-brand-primary uppercase tracking-widest px-4 border-r border-white/10">
          Trending
        </span>
        <div className="flex gap-8 items-center cursor-default">
          {trendingTitles.concat(trendingTitles).map((title, i) => (
            <motion.span
              key={i}
              whileHover={{ color: '#FF3D00' }}
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              {title}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

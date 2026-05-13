import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

export default function BackgroundDecoration() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);

  useEffect(() => {
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* Dynamic Grid */}
      <div 
        className="absolute inset-0 opacity-[0.15] dark:opacity-[0.07]"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Floating Orbs */}
      <motion.div 
        animate={{
          x: [0, 150, -50, 0],
          y: [0, 100, -100, 0],
          scale: [1, 1.4, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[-20%] left-[-20%] w-[70%] max-w-[800px] aspect-square rounded-full will-change-transform transform-gpu opacity-70 md:opacity-100"
        style={{ y: y1, background: 'radial-gradient(circle, var(--color-brand-primary) 0%, transparent 60%)', mixBlendMode: 'screen', opacity: 0.15 } as any}
      />

      <motion.div 
        animate={{
          x: [0, -150, 50, 0],
          y: [0, -100, 100, 0],
          scale: [1, 1.5, 1.3, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-[-20%] right-[-20%] w-[70%] max-w-[800px] aspect-square rounded-full will-change-transform transform-gpu opacity-70 md:opacity-100"
        style={{ y: y2, background: 'radial-gradient(circle, var(--color-brand-secondary) 0%, transparent 60%)', mixBlendMode: 'screen', opacity: 0.1 } as any}
      />

      {/* Interactive Spotlight */}
      <motion.div 
        animate={{
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-0 left-0 w-[800px] h-[800px] transition-opacity duration-1000 opacity-20 dark:opacity-40 pointer-events-none hidden md:block will-change-transform transform-gpu"
        style={{
          background: `radial-gradient(circle, var(--color-brand-primary), transparent 70%)`,
          transform: `translate3d(calc(var(--mouse-x, 0px) - 400px), calc(var(--mouse-y, 0px) - 400px), 0)`
        } as any}
      />

      {/* Ambient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50 dark:to-background/80" />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-brand-primary opacity-20"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -100],
              x: [0, Math.random() * 50 - 25],
              opacity: [0, 0.3, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>
    </div>
  );
}

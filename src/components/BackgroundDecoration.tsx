import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

export default function BackgroundDecoration() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
        style={{ y: y1 }}
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
        className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-brand-primary/10 dark:bg-brand-primary/20 blur-[150px] rounded-full will-change-transform transform-gpu"
      />

      <motion.div 
        style={{ y: y2 }}
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
        className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-brand-secondary/5 dark:bg-brand-secondary/10 blur-[150px] rounded-full will-change-transform transform-gpu"
      />

      {/* Interactive Spotlight */}
      <motion.div 
        animate={{
          opacity: [0.4, 0.6, 0.4]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 transition-opacity duration-1000 opacity-30 dark:opacity-50"
        style={{
          background: `radial-gradient(800px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), var(--color-brand-primary), transparent 85%)`,
          mixBlendMode: 'soft-light'
        } as any}
      />

      {/* Ambient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50 dark:to-background/80" />
    </div>
  );
}

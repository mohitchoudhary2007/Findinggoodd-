import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

export default function BackgroundDecoration() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
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
          x: [0, 100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/10 dark:bg-brand-primary/20 blur-[120px] rounded-full"
      />

      <motion.div 
        style={{ y: y2 }}
        animate={{
          x: [0, -100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-secondary/5 dark:bg-brand-secondary/10 blur-[120px] rounded-full"
      />

      {/* Interactive Spotlight */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000 opacity-30 dark:opacity-50"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, var(--color-brand-primary), transparent 80%)`,
          mixBlendMode: 'soft-light'
        }}
      />

      {/* Ambient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50 dark:to-background/80" />
    </div>
  );
}

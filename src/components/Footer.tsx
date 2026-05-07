import React from 'react';
import { Instagram, Twitter, Facebook, Mail, Shield, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { AppConfig } from '@/src/types';

interface FooterProps {
  onLegalClick: (type: 'privacy' | 'terms') => void;
  config: AppConfig | null;
}

const SocialLink = ({ href, icon: Icon, colorClass }: { href: string; icon: any; colorClass: string }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ 
      scale: 1.2, 
      rotate: [0, -10, 10, 0],
      boxShadow: "0 0 20px var(--color-brand-primary)" 
    }}
    whileTap={{ scale: 0.9 }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
    className={`w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center text-foreground/40 hover:text-white transition-colors relative group overflow-hidden`}
  >
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 bg-brand-primary transition-opacity duration-300`} />
    <Icon size={22} className="relative z-10" />
  </motion.a>
);

export default function Footer({ onLegalClick, config }: FooterProps) {
  const links = config?.socialLinks || {
    instagram: '#',
    twitter: '#',
    facebook: '#',
    mail: 'contact@findinggoodd.com'
  };

  return (
    <footer className="mt-60 bg-surface/20 py-24 px-6 relative overflow-hidden">
      {/* Background Lighting Effect */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-primary/5 blur-[100px] rounded-full pointer-events-none -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-brand-secondary/5 blur-[80px] rounded-full pointer-events-none -ml-20 -mb-20" />
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
        <div className="flex flex-col items-center md:items-start gap-4">
          <h2 className="text-2xl font-bold font-display tracking-tightest">
            {config?.siteName || 'Findinggoodd'}
          </h2>
          <p className="text-foreground/40 text-sm max-w-xs text-center md:text-left">
            The ultimate destination for discovery. High speed, premium quality.
          </p>
        </div>
        
        <div className="flex gap-8">
          <button 
            onClick={() => onLegalClick('privacy')}
            className="text-foreground/40 hover:text-foreground transition-colors flex flex-col items-center gap-2"
          >
            <Shield size={20} />
            <span className="text-[10px] uppercase font-bold tracking-widest">Privacy</span>
          </button>
          <button 
            onClick={() => onLegalClick('terms')}
            className="text-foreground/40 hover:text-foreground transition-colors flex flex-col items-center gap-2"
          >
            <FileText size={20} />
            <span className="text-[10px] uppercase font-bold tracking-widest">Terms</span>
          </button>
        </div>

        <div className="flex gap-4">
          <SocialLink href={links.instagram || '#'} icon={Instagram} colorClass="bg-red-500" />
          <SocialLink href={links.twitter || '#'} icon={Twitter} colorClass="bg-blue-400" />
          <SocialLink href={links.facebook || '#'} icon={Facebook} colorClass="bg-blue-600" />
          <SocialLink href={`mailto:${links.mail || 'contact@findinggoodd.com'}`} icon={Mail} colorClass="bg-brand-primary" />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-8 pt-8 text-center text-foreground/20 text-xs text-balance">
        © {new Date().getFullYear()} Findinggoodd. All rights reserved.
      </div>
    </footer>
  );
}

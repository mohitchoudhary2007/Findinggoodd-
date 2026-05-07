import React from 'react';
import { Instagram, Twitter, Facebook, Mail, Shield, FileText, Settings } from 'lucide-react';
import { AppConfig } from '@/src/types';

interface FooterProps {
  onLegalClick: (type: 'privacy' | 'terms') => void;
  config: AppConfig | null;
}

export default function Footer({ onLegalClick, config }: FooterProps) {
  const links = config?.socialLinks || {
    instagram: '#',
    twitter: '#',
    facebook: '#',
    mail: 'contact@findinggoodd.com'
  };

  return (
    <footer className="mt-20 border-t border-white/5 bg-black/40 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <h2 className="text-2xl font-bold font-display tracking-tightest">
            {config?.siteName || 'Findinggoodd'}
          </h2>
          <p className="text-white/40 text-sm max-w-xs text-center md:text-left">
            The ultimate destination for discovery. High speed, premium quality.
          </p>
        </div>
        
        <div className="flex gap-8">
          <button 
            onClick={() => onLegalClick('privacy')}
            className="text-white/40 hover:text-white transition-colors flex flex-col items-center gap-2"
          >
            <Shield size={20} />
            <span className="text-[10px] uppercase font-bold tracking-widest">Privacy</span>
          </button>
          <button 
            onClick={() => onLegalClick('terms')}
            className="text-white/40 hover:text-white transition-colors flex flex-col items-center gap-2"
          >
            <FileText size={20} />
            <span className="text-[10px] uppercase font-bold tracking-widest">Terms</span>
          </button>
        </div>

        <div className="flex gap-6">
          <a href={links.instagram || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white/40 hover:text-white hover:text-brand-primary transition-all">
            <Instagram size={20} />
          </a>
          <a href={links.twitter || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white/40 hover:text-white hover:text-brand-primary transition-all">
            <Twitter size={20} />
          </a>
          <a href={links.facebook || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white/40 hover:text-white hover:text-brand-primary transition-all">
            <Facebook size={20} />
          </a>
          <a href={`mailto:${links.mail || 'contact@findinggoodd.com'}`} className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-white/40 hover:text-white hover:text-brand-primary transition-all">
            <Mail size={20} />
          </a>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-white/20 text-xs">
        © {new Date().getFullYear()} Findinggoodd. All rights reserved.
      </div>
    </footer>
  );
}

import { Timestamp } from 'firebase/firestore';

export interface Movie {
  id: string;
  name: string;
  posterUrl: string;
  downloadUrl: string;
  trailerUrl: string;
  isTrending: boolean;
  createdAt: Timestamp | Date;
}

export interface Feedback {
  id: string;
  name: string;
  email: string;
  message: string;
  type: 'feedback' | 'request';
  createdAt: Timestamp | Date;
}

export interface Ad {
  id: string;
  type: 'trailer' | 'download';
  mediaType: 'image' | 'video';
  imageUrl: string;
  targetUrl?: string;
  isActive: boolean;
  createdAt: Timestamp | Date;
}

export interface AppConfig {
  trendingMovies: string[];
  trailerAdDuration?: number;
  downloadAdDuration?: number;
  siteName?: string;
  privacyPolicy?: string;
  termsOfService?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    mail?: string;
  };
  updatedAt: Timestamp | Date;
}

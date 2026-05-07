import React, { useState, useEffect } from 'react';
import { 
  Plus, Settings, LogOut, Trash2, Edit3, Save, 
  CheckCircle, Loader2, MessageSquare, List,
  Image as ImageIcon, Link as LinkIcon, Film, X,
  Mail, Lock, Key
} from 'lucide-react';
import { 
  collection, onSnapshot, query, orderBy, 
  addDoc, deleteDoc, doc, updateDoc, serverTimestamp, setDoc, getDoc 
} from 'firebase/firestore';
import { 
  db, 
  auth, 
  signInWithGoogle, 
  handleFirestoreError, 
  OperationType,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from '@/src/lib/firebase';
import { onAuthStateChanged, signOut, ConfirmationResult } from 'firebase/auth';
import { Movie, Feedback, Ad } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast, Toaster } from 'react-hot-toast';
import { Monitor, Play, Eye } from 'lucide-react';
import BackgroundDecoration from '@/src/components/BackgroundDecoration';

const ADMIN_PHONE = '8058349947';
const ADMIN_EMAIL = 'mohitdudwal123@gmail.com';

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [tab, setTab] = useState<'movies' | 'feedback' | 'config' | 'ads'>('movies');

  // Login Form State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // Form State
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [adEditing, setAdEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    posterUrl: '',
    downloadUrl: '',
    trailerUrl: '',
    isTrending: false
  });

  const [adFormData, setAdFormData] = useState({
    type: 'trailer' as 'trailer' | 'download',
    mediaType: 'image' as 'image' | 'video',
    imageUrl: '',
    targetUrl: '',
    isActive: true
  });
  
  const [trendingInput, setTrendingInput] = useState('');
  const [trendingList, setTrendingList] = useState<string[]>([]);
  const [siteName, setSiteName] = useState('Findinggoodd');
  const [trailerAdDuration, setTrailerAdDuration] = useState(5);
  const [downloadAdDuration, setDownloadAdDuration] = useState(10);
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [termsOfService, setTermsOfService] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    twitter: '',
    facebook: '',
    mail: ''
  });

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            setIsAdmin(true);
          } else if (user.email === 'mohitdudwal123@gmail.com' || user.phoneNumber === ADMIN_PHONE) {
            // Auto-bootstrap for the designated owners
            await setDoc(doc(db, 'admins', user.uid), {
              email: user.email || null,
              phoneNumber: user.phoneNumber || null,
              role: 'owner',
              bootstrapped: true
            });
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `admins/${user.uid}`);
        }
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    const qMovies = query(collection(db, 'movies'), orderBy('createdAt', 'desc'));
    const unsubMovies = onSnapshot(qMovies, (snapshot) => {
      setMovies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movie)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'movies');
    });

    const qFeedback = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
    const unsubFeedback = onSnapshot(qFeedback, (snapshot) => {
      setFeedback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Feedback)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'feedback');
    });

    const qAds = query(collection(db, 'ads'), orderBy('createdAt', 'desc'));
    const unsubAds = onSnapshot(qAds, (snapshot) => {
      setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'ads');
    });

    const unsubConfig = onSnapshot(doc(db, 'config', 'app'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setTrendingList(data.trendingMovies || []);
        setSiteName(data.siteName || 'Findinggoodd');
        setTrailerAdDuration(data.trailerAdDuration || 5);
        setDownloadAdDuration(data.downloadAdDuration || 10);
        setPrivacyPolicy(data.privacyPolicy || '');
        setTermsOfService(data.termsOfService || '');
        setSocialLinks(data.socialLinks || { instagram: '', twitter: '', facebook: '', mail: '' });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'config/app');
    });

    return () => {
      unsubMovies();
      unsubFeedback();
      unsubAds();
      unsubConfig();
    };
  }, [isAdmin]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clean phone number input (remove spaces, etc.)
    const cleanPhone = loginPhone.replace(/\s+/g, '').replace('+', '');
    const cleanAdminPhone = ADMIN_PHONE.replace(/\s+/g, '').replace('+', '');

    if (cleanPhone !== cleanAdminPhone && loginPhone !== ADMIN_EMAIL) {
      setLoginError('Invalid administrator credentials.');
      return;
    }
    
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      // Use the email for backend authentication
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, loginPassword);
      toast.success('Access Granted');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setLoginError('ERROR: Email/Password login is not enabled in Firebase Console.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setLoginError('Access Denied. Check your password.');
      } else {
        setLoginError('Authentication service error. Please try again.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, ADMIN_EMAIL);
      setResetSent(true);
      setLoginError(null);
      toast.success('Security reset link dispatched to ' + ADMIN_EMAIL);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err: any) {
      setLoginError('Failed to send reset link. Ensure authentication services are active.');
    }
  };

  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateDoc(doc(db, 'movies', isEditing), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        setIsEditing(null);
      } else {
        await addDoc(collection(db, 'movies'), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      setFormData({ name: '', posterUrl: '', downloadUrl: '', trailerUrl: '', isTrending: false });
    } catch (err) {
      handleFirestoreError(err, isEditing ? OperationType.UPDATE : OperationType.CREATE, isEditing ? `movies/${isEditing}` : 'movies');
    }
  };

  const handleDeleteMovie = async (id: string) => {
    if (confirm("Delete this movie?")) {
      try {
        await deleteDoc(doc(db, 'movies', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `movies/${id}`);
      }
    }
  };

  const handleSaveConfig = async () => {
    try {
      await setDoc(doc(db, 'config', 'app'), {
        trendingMovies: trendingList,
        siteName: siteName,
        trailerAdDuration: trailerAdDuration,
        downloadAdDuration: downloadAdDuration,
        privacyPolicy: privacyPolicy,
        termsOfService: termsOfService,
        socialLinks: socialLinks,
        updatedAt: serverTimestamp()
      });
      alert("Configuration updated successfully!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/app');
    }
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (adEditing) {
        await updateDoc(doc(db, 'ads', adEditing), {
          ...adFormData,
          updatedAt: serverTimestamp()
        });
        setAdEditing(null);
        toast.success('Ad updated');
      } else {
        await addDoc(collection(db, 'ads'), {
          ...adFormData,
          createdAt: serverTimestamp()
        });
        toast.success('Ad published');
      }
      setAdFormData({ type: 'trailer', mediaType: 'image', imageUrl: '', targetUrl: '', isActive: true });
    } catch (err) {
      handleFirestoreError(err, adEditing ? OperationType.UPDATE : OperationType.CREATE, adEditing ? `ads/${adEditing}` : 'ads');
    }
  };

  const handleToggleAd = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'ads', id), {
        isActive: !currentStatus,
        updatedAt: serverTimestamp()
      });
      toast.success('Ad status updated');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `ads/${id}`);
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (confirm("Delete this advertisement permanently?")) {
      try {
        await deleteDoc(doc(db, 'ads', id));
        toast.success('Ad removed');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `ads/${id}`);
      }
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-display"><Loader2 className="animate-spin text-brand-primary" size={48} /></div>;

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden transform-gpu">
        <BackgroundDecoration />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-primary/10 via-background to-background pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md glass-panel p-10 rounded-[2.5rem] shadow-[0_0_50px_rgba(255,61,0,0.1)] relative z-10 before:absolute before:inset-0 before:rounded-[2.5rem] before:p-[1px] before:bg-gradient-to-b before:from-white/10 before:to-transparent before:-z-10 bg-background/50 backdrop-blur-2xl"
        >
          {/* Animated Light Sweep Effect */}
          <motion.div 
            animate={{
              left: ['-100%', '200%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1
            }}
            className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-brand-primary/10 to-transparent skew-x-[-20deg] pointer-events-none"
          />

          <div className="flex flex-col items-center text-center mb-10 relative">
            <motion.div 
              animate={{ 
                boxShadow: ['0 0 10px rgba(255,61,0,0.2)', '0 0 30px rgba(255,61,0,0.5)', '0 0 10px rgba(255,61,0,0.2)']
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/10 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-white/10 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-brand-primary/20 blur-xl mix-blend-screen" />
              <Settings className="text-brand-primary animate-spin-slow relative z-10" size={40} />
            </motion.div>
            <h1 className="text-4xl font-bold font-display tracking-tight mb-2 text-glow-effect">Control Tower</h1>
            <p className="text-foreground/50 text-sm font-medium">Secure access for Findinggoodd administrators</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">Administrator Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-brand-primary transition-colors duration-300" size={20} />
                <input 
                  type="text"
                  value={loginPhone}
                  onChange={e => setLoginPhone(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 pl-12 focus:border-brand-primary focus:bg-black/60 outline-none transition-all duration-300 placeholder:text-foreground/10 focus:shadow-[0_0_20px_rgba(255,61,0,0.15)] focus:-translate-y-0.5"
                  placeholder="admin@findinggoodd.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">Master Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-brand-primary transition-colors duration-300" size={20} />
                <input 
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 pl-12 focus:border-brand-primary focus:bg-black/60 outline-none transition-all duration-300 placeholder:text-foreground/10 focus:shadow-[0_0_20px_rgba(255,61,0,0.15)] focus:-translate-y-0.5"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            {loginError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-medium text-center"
              >
                {loginError}
              </motion.div>
            )}

            {resetSent && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-xl text-brand-primary text-xs font-medium text-center"
              >
                Check {ADMIN_EMAIL} for reset instructions.
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 disabled:opacity-50 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,61,0,0.3)] active:scale-95 mt-6 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <div className="relative z-10 flex items-center gap-3">
                {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} className="group-hover:rotate-12 transition-transform" />}
                Initiate Login
              </div>
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-5 relative z-10">
            <button 
              onClick={handleForgotPassword}
              className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors duration-300 flex items-center gap-2 group hover:text-glow-effect"
            >
              <Key size={14} className="group-hover:rotate-12 transition-transform duration-300 text-brand-primary" />
              Reset Access Credentials
            </button>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <p className="text-[10px] text-white/30 font-medium italic tracking-wider">Authorized Personnel Only</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <BackgroundDecoration />
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative">
          <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-40 h-40 bg-brand-primary/10 blur-[50px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-4xl font-bold font-display flex items-center gap-4">
              <span className="text-glow-effect bg-gradient-to-r from-brand-primary to-white bg-clip-text text-transparent">Control Center</span>
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" title="System Active" />
            </h1>
            <p className="text-foreground/50 mt-1 font-medium">Welcome back, manager. You have total control.</p>
          </div>
          <div className="flex gap-4 relative z-10">
            <button 
              onClick={() => signOut(auth)}
              className="flex items-center gap-2 bg-foreground/5 hover:bg-red-500/10 text-foreground/60 hover:text-red-500 px-6 py-3 rounded-xl transition-all duration-300 border border-transparent hover:border-red-500/20 group"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
              <span className="font-bold tracking-wide">Logout</span>
            </button>
          </div>
        </header>

        <div className="flex gap-4 mb-12 overflow-x-auto scrollbar-hide pb-4">
          <button 
            onClick={() => setTab('movies')}
            className={cn("flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap", tab === 'movies' ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-[0_0_20px_rgba(255,61,0,0.3)] scale-105" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white")}
          >
            <Film size={20} className={tab === 'movies' ? "animate-pulse" : ""} />
            Manage Movies
          </button>
          <button 
            onClick={() => setTab('ads')}
            className={cn("flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap", tab === 'ads' ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-[0_0_20px_rgba(255,61,0,0.3)] scale-105" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white")}
          >
            <Monitor size={20} className={tab === 'ads' ? "animate-pulse" : ""} />
            Manage Ads
          </button>
          <button 
            onClick={() => setTab('config')}
            className={cn("flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap", tab === 'config' ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-[0_0_20px_rgba(255,61,0,0.3)] scale-105" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white")}
          >
            <List size={20} className={tab === 'config' ? "animate-pulse" : ""} />
            Global Settings
          </button>
          <button 
            onClick={() => setTab('feedback')}
            className={cn("flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-300 whitespace-nowrap relative", tab === 'feedback' ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-[0_0_20px_rgba(255,61,0,0.3)] scale-105" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white")}
          >
            <MessageSquare size={20} className={tab === 'feedback' ? "animate-bounce" : ""} />
            User Feedback
            {feedback.length > 0 && tab !== 'feedback' && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-brand-primary text-white text-[10px] flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(255,61,0,0.5)] border-2 border-background animate-pulse">
                {feedback.length}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {tab === 'movies' && (
            <>
                  <div className="lg:col-span-1">
                <form onSubmit={handleSaveMovie} className="glass-panel p-8 rounded-[2rem] sticky top-8 space-y-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-brand-primary/20 transition-colors duration-500" />
                  <h2 className="text-2xl font-bold font-display flex items-center gap-3 relative z-10">
                    {isEditing ? <Edit3 className="text-brand-primary animate-bounce" /> : <Plus className="text-brand-secondary animate-pulse" />}
                    <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{isEditing ? 'Edit Movie' : 'New Movie Entry'}</span>
                  </h2>
                  <div className="space-y-5 relative z-10">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Title Name</label>
                      <input 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-brand-primary outline-none transition-all"
                        placeholder="e.g. Inception"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 flex items-center gap-2">
                        <ImageIcon size={14} /> Poster URL
                      </label>
                      <input 
                        value={formData.posterUrl}
                        onChange={e => setFormData({...formData, posterUrl: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-brand-primary outline-none transition-all"
                        placeholder="https://..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 flex items-center gap-2">
                        <LinkIcon size={14} /> Download URL
                      </label>
                      <input 
                        value={formData.downloadUrl}
                        onChange={e => setFormData({...formData, downloadUrl: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-brand-primary outline-none transition-all"
                        placeholder="https://..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 flex items-center gap-2">
                        <Film size={14} /> Trailer URL
                      </label>
                      <input 
                        value={formData.trailerUrl}
                        onChange={e => setFormData({...formData, trailerUrl: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-brand-primary outline-none transition-all"
                        placeholder="https://youtube.com/..."
                        required
                      />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer group p-4 bg-white/5 rounded-xl border border-white/5 hover:border-brand-primary transition-all">
                      <input 
                        type="checkbox"
                        checked={formData.isTrending}
                        onChange={e => setFormData({...formData, isTrending: e.target.checked})}
                        className="w-5 h-5 accent-brand-primary"
                      />
                      <span className="font-bold text-sm">Mark as Trending</span>
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="flex-1 bg-brand-primary hover:bg-brand-primary/80 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-brand-primary/20">
                      <Save size={20} />
                      {isEditing ? 'Update Movie' : 'Publish Movie'}
                    </button>
                    {isEditing && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsEditing(null);
                          setFormData({ name: '', posterUrl: '', downloadUrl: '', trailerUrl: '', isTrending: false });
                        }}
                        className="bg-white/10 hover:bg-white/20 p-4 rounded-xl"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-2xl font-bold font-display mb-6">Database Library ({movies.length})</h2>
                {movies.map((movie, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    key={movie.id}
                    className="glass-panel p-4 rounded-2xl flex items-center gap-6 group hover:border-brand-primary/50 hover:shadow-[0_0_30px_rgba(255,61,0,0.15)] transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/0 via-brand-primary/5 to-brand-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                    <img src={movie.posterUrl} className="w-20 h-28 object-cover rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300" alt="" referrerPolicy="no-referrer" />
                    <div className="flex-1 relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg group-hover:text-glow-effect transition-all duration-300">{movie.name}</h3>
                        {movie.isTrending && <span className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-[8px] font-black px-2 py-0.5 rounded tracking-tighter uppercase shadow-[0_0_10px_rgba(255,61,0,0.4)] animate-pulse">Trend</span>}
                      </div>
                      <div className="flex items-center gap-4 text-white/30 text-xs">
                        <span className="flex items-center gap-1"><LinkIcon size={12} /> {movie.downloadUrl.substring(0, 30)}...</span>
                        <span className="flex items-center gap-1"><Film size={12} /> Trailer Linked</span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                      <button 
                        onClick={() => {
                          setIsEditing(movie.id);
                          setFormData({
                            name: movie.name,
                            posterUrl: movie.posterUrl,
                            downloadUrl: movie.downloadUrl,
                            trailerUrl: movie.trailerUrl,
                            isTrending: movie.isTrending
                          });
                        }}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteMovie(movie.id)}
                        className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {tab === 'config' && (
            <div className="lg:col-span-2 space-y-12">
              <div className="glass-panel p-8 rounded-3xl space-y-8">
                <div>
                  <h2 className="text-2xl font-bold font-display mb-2">Marquee Manager</h2>
                  <p className="text-white/40">These names scroll across the top of the homepage.</p>
                </div>
                
                <div className="flex gap-4">
                  <input 
                    value={trendingInput}
                    onChange={e => setTrendingInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (setTrendingList([...trendingList, trendingInput]), setTrendingInput(''))}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 focus:border-brand-primary outline-none transition-all"
                    placeholder="Add movie to trending bar..."
                  />
                  <button 
                    onClick={() => {
                      if (trendingInput) {
                        setTrendingList([...trendingList, trendingInput]);
                        setTrendingInput('');
                      }
                    }}
                    className="bg-brand-primary p-4 rounded-xl"
                  >
                    <Plus />
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <AnimatePresence>
                    {trendingList.map((item, i) => (
                      <motion.div 
                        key={i + item}
                        layout
                        initial={{ scale: 0.8, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white/10 px-4 py-2 rounded-xl flex items-center gap-3 border border-white/5 hover:bg-white/20 hover:border-brand-primary/50 transition-all duration-300 group"
                      >
                        <span className="font-medium group-hover:text-glow-effect transition-all">{item}</span>
                        <button 
                          onClick={() => setTrendingList(trendingList.filter((_, idx) => idx !== i))}
                          className="text-white/20 hover:text-red-500 transition-colors duration-300"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold font-display mb-2">Global Identity</h2>
                    <p className="text-white/40">Change the name and ad display settings.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Website Name</label>
                      <input 
                        value={siteName}
                        onChange={e => setSiteName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-brand-primary outline-none transition-all"
                        placeholder="e.g. Findinggoodd"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Trailer Ad (sec)</label>
                        <input 
                          type="number"
                          min="5"
                          max="30"
                          value={trailerAdDuration}
                          onChange={e => setTrailerAdDuration(parseInt(e.target.value) || 5)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-brand-primary outline-none transition-all text-center"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Download Ad (sec)</label>
                        <input 
                          type="number"
                          min="5"
                          max="30"
                          value={downloadAdDuration}
                          onChange={e => setDownloadAdDuration(parseInt(e.target.value) || 10)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-brand-primary outline-none transition-all text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold font-display mb-2">Legal Sections</h2>
                    <p className="text-white/40">Edit the privacy policy and terms shown to users.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Privacy Policy</label>
                      <textarea 
                        value={privacyPolicy}
                        onChange={e => setPrivacyPolicy(e.target.value)}
                        rows={10}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-brand-primary outline-none transition-all resize-none font-mono text-sm"
                        placeholder="Enter privacy policy text here..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Terms of Service</label>
                      <textarea 
                        value={termsOfService}
                        onChange={e => setTermsOfService(e.target.value)}
                        rows={10}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-brand-primary outline-none transition-all resize-none font-mono text-sm"
                        placeholder="Enter terms of service text here..."
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold font-display mb-2">Social Media Presence</h2>
                    <p className="text-white/40">Update the links shown in the website footer.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Instagram URL</label>
                      <input 
                        value={socialLinks.instagram}
                        onChange={e => setSocialLinks({...socialLinks, instagram: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-brand-primary outline-none transition-all"
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Twitter URL</label>
                      <input 
                        value={socialLinks.twitter}
                        onChange={e => setSocialLinks({...socialLinks, twitter: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-brand-primary outline-none transition-all"
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Facebook URL</label>
                      <input 
                        value={socialLinks.facebook}
                        onChange={e => setSocialLinks({...socialLinks, facebook: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-brand-primary outline-none transition-all"
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Contact Email</label>
                      <input 
                        value={socialLinks.mail}
                        onChange={e => setSocialLinks({...socialLinks, mail: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-brand-primary outline-none transition-all"
                        placeholder="contact@findinggoodd.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <button 
                    onClick={handleSaveConfig}
                    className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 px-12 py-4 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_30px_rgba(255,61,0,0.3)] transition-all duration-300 active:scale-95 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                    <CheckCircle size={20} className="relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="relative z-10">Apply All Changes</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'feedback' && (
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold font-display mb-8 relative inline-block">
                User Communications
                <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-gradient-to-r from-brand-primary to-transparent rounded-full" />
              </h2>
              {feedback.map((item, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
                  key={item.id} 
                  className="glass-panel p-8 rounded-3xl space-y-4 hover:border-brand-primary/30 hover:shadow-[0_0_30px_rgba(255,61,0,0.1)] transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-[30px] rounded-full pointer-events-none group-hover:bg-brand-primary/15 transition-colors duration-500" />
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-xl">{item.name}</h3>
                        <span className={cn(
                          "text-[10px] font-black uppercase px-2 py-0.5 rounded",
                          item.type === 'request' ? "bg-brand-primary text-white" : "bg-brand-secondary text-black"
                        )}>
                          {item.type}
                        </span>
                      </div>
                      <p className="text-white/40 text-sm">{item.email}</p>
                    </div>
                    <button 
                      onClick={async () => {
                        if (confirm("Clear this feedback?")) {
                          try {
                            await deleteDoc(doc(db, 'feedback', item.id));
                            toast.success('Feedback cleared');
                          } catch (error) {
                            handleFirestoreError(error, OperationType.DELETE, `feedback/${item.id}`);
                          }
                        }
                      }}
                      className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all duration-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 leading-relaxed text-white/80 group-hover:bg-white/10 transition-colors duration-300 relative z-10">
                    {item.message}
                  </div>
                </motion.div>
              ))}
              {feedback.length === 0 && (
                <div className="py-20 text-center opacity-20">
                  <MessageSquare size={64} className="mx-auto mb-4" />
                  <p className="text-2xl font-bold">No messages yet</p>
                </div>
              )}
            </div>
          )}

          {tab === 'ads' && (
            <>
              <div className="lg:col-span-1">
                <form onSubmit={handleSaveAd} className="glass-panel p-8 rounded-[2rem] sticky top-8 space-y-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-brand-primary/20 transition-colors duration-500" />
                  <h2 className="text-2xl font-bold font-display flex items-center gap-3 relative z-10">
                    {adEditing ? <Edit3 className="text-brand-primary animate-bounce" /> : <Plus className="text-brand-secondary animate-pulse" />}
                    <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{adEditing ? 'Edit Ad' : 'New Ad Banner'}</span>
                  </h2>
                  <div className="space-y-5 relative z-10">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Ad Placement</label>
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => setAdFormData({...adFormData, type: 'trailer'})}
                          className={cn(
                            "flex-1 py-3 rounded-xl font-bold text-xs border transition-all",
                            adFormData.type === 'trailer' 
                              ? "bg-brand-primary border-brand-primary text-white" 
                              : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                          )}
                        >
                          Trailer Ads ({trailerAdDuration}s)
                        </button>
                        <button 
                          type="button"
                          onClick={() => setAdFormData({...adFormData, type: 'download'})}
                          className={cn(
                            "flex-1 py-3 rounded-xl font-bold text-xs border transition-all",
                            adFormData.type === 'download' 
                              ? "bg-brand-primary border-brand-primary text-white" 
                              : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                          )}
                        >
                          Download Ads ({downloadAdDuration}s)
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Media Type</label>
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => setAdFormData({...adFormData, mediaType: 'image'})}
                          className={cn(
                            "flex-1 py-3 rounded-xl font-bold text-xs border transition-all",
                            adFormData.mediaType === 'image' 
                              ? "bg-brand-primary border-brand-primary text-white" 
                              : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                          )}
                        >
                          Photo/Static
                        </button>
                        <button 
                          type="button"
                          onClick={() => setAdFormData({...adFormData, mediaType: 'video'})}
                          className={cn(
                            "flex-1 py-3 rounded-xl font-bold text-xs border transition-all",
                            adFormData.mediaType === 'video' 
                              ? "bg-brand-primary border-brand-primary text-white" 
                              : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                          )}
                        >
                          Video Ad
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 flex items-center gap-2">
                        <ImageIcon size={14} /> {adFormData.mediaType === 'video' ? 'Video File URL (Direct)' : 'Banner Image URL'}
                      </label>
                      <input 
                        value={adFormData.imageUrl}
                        onChange={e => setAdFormData({...adFormData, imageUrl: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-brand-primary outline-none transition-all"
                        placeholder="https://..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1 flex items-center gap-2">
                        <LinkIcon size={14} /> Target URL (Optional)
                      </label>
                      <input 
                        value={adFormData.targetUrl}
                        onChange={e => setAdFormData({...adFormData, targetUrl: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-brand-primary outline-none transition-all"
                        placeholder="https://..."
                      />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer group p-4 bg-white/5 rounded-xl border border-white/5 hover:border-brand-primary transition-all">
                      <input 
                        type="checkbox"
                        checked={adFormData.isActive}
                        onChange={e => setAdFormData({...adFormData, isActive: e.target.checked})}
                        className="w-5 h-5 accent-brand-primary"
                      />
                      <span className="font-bold text-sm">Active & Visible</span>
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="flex-1 bg-brand-primary hover:bg-brand-primary/80 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-brand-primary/20">
                      <Save size={20} />
                      {adEditing ? 'Update Ad' : 'Publish Ad'}
                    </button>
                    {adEditing && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setAdEditing(null);
                          setAdFormData({ type: 'trailer', mediaType: 'image', imageUrl: '', targetUrl: '', isActive: true });
                        }}
                        className="bg-white/10 hover:bg-white/20 p-4 rounded-xl"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-2xl font-bold font-display mb-6">Active Ad Library ({ads.length})</h2>
                {ads.map((ad, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    key={ad.id}
                    className="glass-panel p-4 rounded-2xl flex items-center gap-6 group hover:border-brand-primary/50 hover:shadow-[0_0_30px_rgba(255,61,0,0.15)] transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/0 via-brand-primary/5 to-brand-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                    <div className="w-40 h-24 bg-foreground/5 rounded-xl overflow-hidden shadow-lg border border-white/10 relative z-10 group-hover:scale-105 transition-transform duration-300">
                      {ad.mediaType === 'video' ? (
                        <video src={ad.imageUrl} className="w-full h-full object-cover" muted loop autoPlay />
                      ) : (
                        <img src={ad.imageUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                      )}
                    </div>
                    <div className="flex-1 relative z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm truncate max-w-[200px] group-hover:text-amber-400 transition-colors duration-300">{ad.imageUrl}</h3>
                        <span className={cn(
                          "text-[8px] font-black px-2 py-0.5 rounded tracking-tighter uppercase",
                          ad.isActive ? "bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.4)] animate-pulse" : "bg-white/10 text-white/40"
                        )}>
                          {ad.isActive ? 'Live' : 'Paused'}
                        </span>
                        <span className="text-[8px] font-black px-2 py-0.5 rounded tracking-tighter uppercase bg-brand-primary/20 text-brand-primary border border-brand-primary/20">
                          {ad.type} ({ad.type === 'trailer' ? trailerAdDuration : downloadAdDuration}s)
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-white/30 text-[10px]">
                        <span className="flex items-center gap-1"><LinkIcon size={10} /> {ad.targetUrl || 'No Link'}</span>
                        <span className="flex items-center gap-1"><Eye size={10} /> {ad.type === 'trailer' ? 'Shown on Trailers' : 'Shown on Downloads'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                      <button 
                        onClick={() => handleToggleAd(ad.id, ad.isActive)}
                        className={cn(
                          "p-3 rounded-xl transition-all",
                          ad.isActive ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                        )}
                        title={ad.isActive ? 'Pause' : 'Activate'}
                      >
                        <Play size={18} className={cn(ad.isActive ? "rotate-90" : "")} />
                      </button>
                      <button 
                        onClick={() => {
                          setAdEditing(ad.id);
                          setAdFormData({
                            type: ad.type as 'trailer' | 'download',
                            mediaType: (ad.mediaType || 'image') as 'image' | 'video',
                            imageUrl: ad.imageUrl,
                            targetUrl: ad.targetUrl || '',
                            isActive: ad.isActive
                          });
                        }}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteAd(ad.id)}
                        className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
                {ads.length === 0 && (
                  <div className="py-20 text-center opacity-10">
                    <Monitor size={64} className="mx-auto mb-4" />
                    <p className="text-xl font-bold">No advertisement banners yet</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

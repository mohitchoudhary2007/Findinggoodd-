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
import { Movie, Feedback } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast, Toaster } from 'react-hot-toast';
import BackgroundDecoration from '@/src/components/BackgroundDecoration';

const ADMIN_PHONE = '8058349947';
const ADMIN_EMAIL = 'mohitdudwal123@gmail.com';

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [tab, setTab] = useState<'movies' | 'feedback' | 'config'>('movies');

  // Login Form State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // Form State
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    posterUrl: '',
    downloadUrl: '',
    trailerUrl: '',
    isTrending: false
  });
  
  const [trendingInput, setTrendingInput] = useState('');
  const [trendingList, setTrendingList] = useState<string[]>([]);
  const [siteName, setSiteName] = useState('Findinggoodd');
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

    const unsubConfig = onSnapshot(doc(db, 'config', 'app'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setTrendingList(data.trendingMovies || []);
        setSiteName(data.siteName || 'Findinggoodd');
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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-display"><Loader2 className="animate-spin text-brand-primary" size={48} /></div>;

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <BackgroundDecoration />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md glass-panel p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary/0 via-brand-primary to-brand-primary/0" />
          
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/5">
              <Settings className="text-brand-primary animate-pulse-slow" size={40} />
            </div>
            <h1 className="text-4xl font-bold font-display tracking-tight mb-2">Control Tower</h1>
            <p className="text-foreground/40 text-sm">Secure access for Findinggoodd administrators</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-1">Administrator Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-brand-primary transition-colors" size={20} />
                <input 
                  type="text"
                  value={loginPhone}
                  onChange={e => setLoginPhone(e.target.value)}
                  className="w-full bg-foreground/5 border border-border rounded-2xl p-4 pl-12 focus:border-brand-primary outline-none transition-all placeholder:text-foreground/10"
                  placeholder="admin@findinggoodd.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-1">Master Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-brand-primary transition-colors" size={20} />
                <input 
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full bg-foreground/5 border border-border rounded-2xl p-4 pl-12 focus:border-brand-primary outline-none transition-all placeholder:text-foreground/10"
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
              className="w-full bg-brand-primary hover:bg-brand-primary/80 disabled:opacity-50 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all hover:shadow-lg hover:shadow-brand-primary/30 active:scale-95 mt-4"
            >
              {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
              Initiate Login
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4">
            <button 
              onClick={handleForgotPassword}
              className="text-white/30 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 group"
            >
              <Key size={14} className="group-hover:rotate-12 transition-transform" />
              Reset Access Credentials
            </button>
            <div className="h-px w-20 bg-white/5" />
            <p className="text-[10px] text-white/20 font-medium italic">Authorized Personnel Only</p>
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
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold font-display">Control Center</h1>
            <p className="text-foreground/40">Welcome back, manager. You have total control.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => signOut(auth)}
              className="flex items-center gap-2 bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground px-6 py-3 rounded-xl transition-all"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        <div className="flex gap-4 mb-12 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setTab('movies')}
            className={cn("flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all whitespace-nowrap", tab === 'movies' ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "bg-white/5 text-white/40 hover:bg-white/10")}
          >
            <Film size={20} />
            Manage Movies
          </button>
          <button 
            onClick={() => setTab('config')}
            className={cn("flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all whitespace-nowrap", tab === 'config' ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "bg-white/5 text-white/40 hover:bg-white/10")}
          >
            <List size={20} />
            Global Settings
          </button>
          <button 
            onClick={() => setTab('feedback')}
            className={cn("flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all whitespace-nowrap relative", tab === 'feedback' ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "bg-white/5 text-white/40 hover:bg-white/10")}
          >
            <MessageSquare size={20} />
            User Feedback
            {feedback.length > 0 && tab !== 'feedback' && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-secondary text-black text-[10px] flex items-center justify-center rounded-full">
                {feedback.length}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {tab === 'movies' && (
            <>
              <div className="lg:col-span-1">
                <form onSubmit={handleSaveMovie} className="glass-panel p-8 rounded-3xl sticky top-8 space-y-6">
                  <h2 className="text-2xl font-bold font-display flex items-center gap-3">
                    {isEditing ? <Edit3 /> : <Plus />}
                    {isEditing ? 'Edit Movie' : 'New Movie Entry'}
                  </h2>
                  <div className="space-y-4">
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
                {movies.map(movie => (
                  <motion.div 
                    layout
                    key={movie.id}
                    className="glass-panel p-4 rounded-2xl flex items-center gap-6 group hover:border-brand-primary/30 transition-all"
                  >
                    <img src={movie.posterUrl} className="w-20 h-28 object-cover rounded-xl shadow-lg" alt="" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{movie.name}</h3>
                        {movie.isTrending && <span className="bg-brand-secondary text-black text-[8px] font-black px-2 py-0.5 rounded tracking-tighter uppercase">Trend</span>}
                      </div>
                      <div className="flex items-center gap-4 text-white/30 text-xs">
                        <span className="flex items-center gap-1"><LinkIcon size={12} /> {movie.downloadUrl.substring(0, 30)}...</span>
                        <span className="flex items-center gap-1"><Film size={12} /> Trailer Linked</span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  {trendingList.map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white/10 px-4 py-2 rounded-xl flex items-center gap-3 border border-white/5"
                    >
                      <span className="font-medium">{item}</span>
                      <button 
                        onClick={() => setTrendingList(trendingList.filter((_, idx) => idx !== i))}
                        className="text-white/20 hover:text-white transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-8 border-t border-white/5 space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold font-display mb-2">Global Identity</h2>
                    <p className="text-white/40">Change the name of your website.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Website Name</label>
                    <input 
                      value={siteName}
                      onChange={e => setSiteName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:border-brand-primary outline-none transition-all"
                      placeholder="e.g. Findinggoodd"
                    />
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
                    className="bg-brand-primary hover:bg-brand-primary/80 px-12 py-4 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-brand-primary/20 transition-all active:scale-95"
                  >
                    <CheckCircle size={20} />
                    Apply All Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'feedback' && (
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold font-display mb-8">User Communications</h2>
              {feedback.map(item => (
                <div key={item.id} className="glass-panel p-8 rounded-3xl space-y-4">
                  <div className="flex justify-between items-start">
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
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                    >
                      <Trash2 size={18} className="text-white/30 hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 leading-relaxed text-white/80">
                    {item.message}
                  </div>
                </div>
              ))}
              {feedback.length === 0 && (
                <div className="py-20 text-center opacity-20">
                  <MessageSquare size={64} className="mx-auto mb-4" />
                  <p className="text-2xl font-bold">No messages yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

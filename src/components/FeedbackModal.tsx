import React, { useState } from 'react';
import { X, Send, MessageCircle, Bug } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';

const schema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  message: z.string().min(5, "Message is too short"),
  type: z.enum(["feedback", "request"])
});

type FormData = z.infer<typeof schema>;

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'feedback' }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        ...data,
        createdAt: serverTimestamp()
      });
      setIsSuccess(true);
      reset();
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-surface border border-white/10 rounded-3xl p-8 shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
              <X size={24} />
            </button>
            
            <h2 className="text-3xl font-bold font-display mb-2">Feedback & Requests</h2>
            <p className="text-white/60 mb-8">Request a movie or let us know how we're doing.</p>
            
            {isSuccess ? (
              <div className="py-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Send size={32} className="text-white" />
                </motion.div>
                <h3 className="text-xl font-bold">Successfully Sent!</h3>
                <p className="text-white/60">Thank you for your message.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Name</label>
                    <input
                      {...register("name")}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary outline-none transition-colors"
                      placeholder="Your name"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Email</label>
                    <input
                      {...register("email")}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary outline-none transition-colors"
                      placeholder="email@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Type</label>
                  <div className="flex gap-2">
                    <label className="flex-1 cursor-pointer group">
                      <input type="radio" {...register("type")} value="feedback" className="hidden peer" />
                      <div className="flex items-center justify-center gap-2 py-3 border border-white/10 rounded-xl peer-checked:bg-white/10 peer-checked:border-white/30 transition-all">
                        <MessageCircle size={18} />
                        <span className="text-sm font-medium">Feedback</span>
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer group">
                      <input type="radio" {...register("type")} value="request" className="hidden peer" />
                      <div className="flex items-center justify-center gap-2 py-3 border border-white/10 rounded-xl peer-checked:bg-white/10 peer-checked:border-white/30 transition-all">
                        <Bug size={18} />
                        <span className="text-sm font-medium">Request</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Message</label>
                  <textarea
                    {...register("message")}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-brand-primary outline-none transition-colors resize-none"
                    placeholder="Enter your message here..."
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                </div>

                <button
                  disabled={isSubmitting}
                  className="w-full bg-brand-primary hover:bg-brand-primary/80 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-brand-primary/20"
                >
                  <Send size={20} />
                  {isSubmitting ? "Sending..." : "Submit Message"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      // Show success screen regardless of outcome to prevent account enumeration
      setSubmitted(true);
    } catch (err) {
      setErrorMsg('Failed to connect to authentication server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream/30">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 sm:py-24">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="text-center space-y-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
                Forgot your password?
              </h1>
              <p className="text-xs text-brand-cocoa/75 normal-case tracking-normal">
                Enter your email address and we'll send you a secure link to reset your password.
              </p>
              <div className="w-10 h-[1px] bg-brand-rose mx-auto mt-1" />
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3 rounded text-center">
                {errorMsg}
              </div>
            )}

            {submitted ? (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 size={24} />
                </div>
                <p className="text-xs text-brand-cocoa/80 normal-case tracking-normal leading-relaxed">
                  If an account exists for this email address, you'll receive a password reset link shortly.
                </p>
                <div className="pt-4 border-t border-brand-beige/50">
                  <Link
                    href="/login"
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-rose hover:text-brand-cocoa transition-colors"
                  >
                    <span>Back to Sign In</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold uppercase tracking-wider text-brand-cocoa">
                <div className="space-y-1.5">
                  <label className="block">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-cocoa/40" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-brand-cream border border-brand-beige rounded pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-brand-rose font-medium normal-case text-brand-cocoa"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-rose hover:bg-brand-cocoa text-brand-cream transition-colors py-3.5 px-4 rounded font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="text-[10px] text-brand-rose hover:text-brand-cocoa transition-colors"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

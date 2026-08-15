'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { createBrowserClient } from '@/lib/supabase/client';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function UpdatePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkSession, user } = useStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasValidSession, setHasValidSession] = useState(true);

  // Simulated email from URL query for fallback mock mode testing
  const mockEmail = searchParams.get('email') || '';

  useEffect(() => {
    // 1. If Supabase configured, check hash parameters / session
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const checkSupabaseSession = async () => {
        const supabase = createBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        // If no active session, wait a bit for hash to be processed, or check context user
        if (!session && !user) {
          // Allow small delay for hash token parsing
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (!retrySession) {
              setHasValidSession(false);
            }
          }, 1200);
        }
      };
      checkSupabaseSession();
    } else {
      // 2. Fallback Mode: Valid if mockEmail query param is present or user is logged in
      if (!mockEmail && !user) {
        setHasValidSession(false);
      }
    }
  }, [user, mockEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      // 1. Dynamic Mode: Update Supabase Auth User password
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createBrowserClient();
        const { error } = await supabase.auth.updateUser({
          password: password,
        });

        if (error) {
          setErrorMsg(error.message || 'Failed to update password.');
          setLoading(false);
          return;
        }

        // Successfully updated
        setSubmitted(true);
        await checkSession(); // reload profile session
      } else {
        // 2. Fallback Mode: POST to local fallback endpoint
        const targetEmail = mockEmail || user?.email;
        if (!targetEmail) {
          setErrorMsg('No active session found.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth/update-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: targetEmail, password }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setSubmitted(true);
        } else {
          setErrorMsg(data.message || 'Failed to update password.');
        }
      }
    } catch (err) {
      console.error('Password update submit error:', err);
      setErrorMsg('A connection error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasValidSession) {
    return (
      <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 sm:p-8 shadow-sm space-y-6 text-center">
        <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center border border-rose-100">
          <AlertCircle size={24} />
        </div>
        <h2 className="font-serif text-lg font-bold text-brand-cocoa">
          Link Invalid or Expired
        </h2>
        <p className="text-xs text-brand-cocoa/70 leading-relaxed normal-case tracking-normal">
          This password reset link is invalid or has expired.
        </p>
        <div className="pt-4 border-t border-brand-beige/50">
          <Link
            href="/forgot-password"
            className="w-full bg-brand-rose hover:bg-brand-cocoa text-brand-cream py-3 rounded font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-colors shadow-sm"
          >
            <span>Request a New Reset Link</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 sm:p-8 shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
          Create a new password
        </h1>
        <p className="text-xs text-brand-cocoa/75 normal-case tracking-normal">
          Enter your new password below.
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
          <p className="text-xs font-bold text-emerald-800">
            Password updated successfully. ♡
          </p>
          <p className="text-xs text-brand-cocoa/70 leading-relaxed normal-case tracking-normal">
            You can now sign in using your new password.
          </p>
          <div className="pt-4 border-t border-brand-beige/50">
            <Link
              href="/login"
              className="w-full bg-brand-rose hover:bg-brand-cocoa text-brand-cream py-3 rounded font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-colors shadow-sm"
            >
              <span>Sign In</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold uppercase tracking-wider text-brand-cocoa">
          <div className="space-y-1.5">
            <label className="block">New Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-cocoa/40" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-brand-cream border border-brand-beige rounded pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-brand-rose font-medium normal-case text-brand-cocoa"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block">Confirm New Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-cocoa/40" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
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
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Update Password</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function UpdatePassword() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-cream/30">
      <AnnouncementBar />
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 sm:py-24">
        <div className="max-w-md w-full mx-auto px-4">
          <Suspense fallback={
            <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-12 flex items-center justify-center">
              <Loader2 className="animate-spin text-brand-rose" size={24} />
            </div>
          }>
            <UpdatePasswordForm />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

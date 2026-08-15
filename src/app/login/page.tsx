'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function LoginForm() {
  const router = useRouter();
  const { checkSession } = useStore();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh the shared session before navigating, otherwise the next page
        // still sees the signed-out state from before this login.
        await checkSession();
        router.push(data.role === 'admin' ? '/admin' : redirectUrl);
      } else {
        setErrorMsg(data.message || 'Invalid email or password. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login submit error:', err);
      setErrorMsg('Something went wrong. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-20 flex-grow w-full flex flex-col justify-center">
      <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 sm:p-8 shadow-sm space-y-6">
        
        <div className="text-center space-y-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
            Welcome Back
          </h1>
          <p className="text-xs text-brand-cocoa/75">
            Sign in to continue to your Neeshiartique account.
          </p>
          <div className="w-10 h-[1px] bg-brand-rose mx-auto mt-1" />
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3 rounded text-center">
            {errorMsg}
          </div>
        )}

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

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block">Password</label>
              <button
                type="button"
                onClick={() => alert('To reset your password, please contact support at Neeshita.art27@gmail.com.')}
                className="text-[10px] text-brand-rose hover:text-brand-cocoa transition-colors capitalize font-semibold tracking-normal"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-cocoa/40" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-brand-cream border border-brand-beige rounded pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-brand-rose font-medium normal-case text-brand-cocoa"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-rose hover:bg-brand-cocoa text-brand-cream transition-colors font-bold text-xs uppercase tracking-widest py-4 px-6 rounded flex items-center justify-center space-x-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>

        </form>

        {/* Registration link */}
        <div className="text-center text-xs font-semibold text-brand-cocoa/70 border-t border-brand-beige/50 pt-4">
          New to Neeshiartique?{' '}
          <Link href={`/register?redirect=${encodeURIComponent(redirectUrl)}`} className="text-brand-rose hover:text-brand-cocoa transition-colors font-bold">
            Create Account
          </Link>
        </div>

      </div>
    </main>
  );
}

export default function Login() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Navbar */}
      <Navbar />

      {/* Main Login Form with Suspense to allow useSearchParams */}
      <Suspense fallback={
        <main className="max-w-md mx-auto px-4 py-20 flex-grow w-full flex flex-col justify-center items-center">
          <Loader2 className="animate-spin text-brand-rose" size={24} />
        </main>
      }>
        <LoginForm />
      </Suspense>

      {/* Footer */}
      <Footer />
    </div>
  );
}

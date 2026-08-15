'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Mail, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function RegisterForm() {
  const router = useRouter();
  const { checkSession } = useStore();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Pick up the new session before navigating away.
        await checkSession();
        router.push(redirectUrl);
      } else {
        setErrorMsg(data.message || 'Registration failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Registration submit error:', err);
      setErrorMsg('Something went wrong. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-16 flex-grow w-full flex flex-col justify-center">
      <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 sm:p-8 shadow-sm space-y-6">
        
        <div className="text-center space-y-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
            Create Account
          </h1>
          <p className="text-xs text-brand-cocoa/75">
            Sign up to start ordering custom crochet designs.
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
            <label className="block">Full Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-cocoa/40" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-brand-cream border border-brand-beige rounded pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-brand-rose font-medium normal-case text-brand-cocoa"
              />
            </div>
          </div>

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
            <label className="block">Phone Number</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-cocoa/40" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your Phone Number"
                className="w-full bg-brand-cream border border-brand-beige rounded pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-brand-rose font-medium normal-case text-brand-cocoa"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block">Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-cocoa/40" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full bg-brand-cream border border-brand-beige rounded pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-brand-rose font-medium normal-case text-brand-cocoa"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block">Confirm Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-cocoa/40" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
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
                <span>Registering...</span>
              </>
            ) : (
              <>
                <span>Register</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>

        </form>

        {/* Login link */}
        <div className="text-center text-xs font-semibold text-brand-cocoa/70 border-t border-brand-beige/50 pt-4">
          Already have an account?{' '}
          <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`} className="text-brand-rose hover:text-brand-cocoa transition-colors font-bold">
            Sign In
          </Link>
        </div>

      </div>
    </main>
  );
}

export default function Register() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Navbar */}
      <Navbar />

      {/* Main Registration Form with Suspense */}
      <Suspense fallback={
        <main className="max-w-md mx-auto px-4 py-20 flex-grow w-full flex flex-col justify-center items-center">
          <Loader2 className="animate-spin text-brand-rose" size={24} />
        </main>
      }>
        <RegisterForm />
      </Suspense>

      {/* Footer */}
      <Footer />
    </div>
  );
}

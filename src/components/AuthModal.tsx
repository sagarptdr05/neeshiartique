'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Lock, Mail, User, Phone, Loader2, ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function AuthModal() {
  const {
    showAuthModal,
    setShowAuthModal,
    authRedirectAction,
    setAuthRedirectAction,
    checkSession,
  } = useStore();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleClose = () => {
    setShowAuthModal(false);
    setAuthRedirectAction(null);
    setErrorMsg('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await checkSession();
        setShowAuthModal(false);
        // Execute the deferred action (e.g. adding item to cart)
        if (authRedirectAction) {
          authRedirectAction();
        }
        setAuthRedirectAction(null);
      } else {
        setErrorMsg(data.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
          confirmPassword: regConfirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await checkSession();
        setShowAuthModal(false);
        if (authRedirectAction) {
          authRedirectAction();
        }
        setAuthRedirectAction(null);
      } else {
        setErrorMsg(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-brand-cocoa/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal Box */}
      <div className="relative bg-brand-cream border border-brand-beige w-full max-w-md rounded-lg shadow-2xl overflow-hidden z-10 p-6 sm:p-8 animate-slide-up flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-full text-brand-cocoa hover:text-brand-rose transition-colors"
        >
          <X size={20} />
        </button>

        {/* Heading */}
        <div className="text-center space-y-1 mb-6">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-cocoa">
            Please sign in to continue
          </h3>
          <p className="text-[11px] font-semibold text-brand-rose uppercase tracking-wider">
            Stitching details require authentication. ♡
          </p>
        </div>

        {/* Tabs switcher */}
        <div className="flex border border-brand-beige rounded overflow-hidden text-[10px] font-bold text-brand-cocoa uppercase tracking-wider mb-6 flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg('');
            }}
            className={`flex-grow py-2.5 transition-colors ${
              tab === 'login' ? 'bg-brand-rose text-brand-cream' : 'bg-brand-cream hover:bg-brand-beige/25'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg('');
            }}
            className={`flex-grow py-2.5 transition-colors ${
              tab === 'register' ? 'bg-brand-rose text-brand-cream' : 'bg-brand-cream hover:bg-brand-beige/25'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold p-2.5 rounded text-center mb-4 flex-shrink-0">
            {errorMsg}
          </div>
        )}

        {/* Scrollable forms */}
        <div className="overflow-y-auto pr-1 flex-grow">
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-bold uppercase tracking-wider text-brand-cocoa">
              <div className="space-y-1">
                <label className="block">Email Address</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cocoa/40" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-brand-cream border border-brand-beige rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-rose font-medium normal-case text-brand-cocoa"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block">Password</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cocoa/40" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-brand-cream border border-brand-beige rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-rose font-medium normal-case text-brand-cocoa"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-rose hover:bg-brand-cocoa text-brand-cream py-3 rounded font-bold text-xs tracking-widest flex items-center justify-center space-x-1.5 shadow-sm mt-4 uppercase"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={13} />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs font-bold uppercase tracking-wider text-brand-cocoa">
              <div className="space-y-0.5">
                <label className="block">Full Name</label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cocoa/40" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Sagar Patidar"
                    className="w-full bg-brand-cream border border-brand-beige rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-rose font-medium normal-case text-brand-cocoa"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="block">Email Address</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cocoa/40" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-brand-cream border border-brand-beige rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-rose font-medium normal-case text-brand-cocoa"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="block">Phone Number</label>
                <div className="relative">
                  <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cocoa/40" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="e.g. 6388992271"
                    className="w-full bg-brand-cream border border-brand-beige rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-rose font-medium normal-case text-brand-cocoa"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="block">Password</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cocoa/40" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-brand-cream border border-brand-beige rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-rose font-medium normal-case text-brand-cocoa"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="block">Confirm Password</label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-cocoa/40" />
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-brand-cream border border-brand-beige rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-brand-rose font-medium normal-case text-brand-cocoa"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-rose hover:bg-brand-cocoa text-brand-cream py-3 rounded font-bold text-xs tracking-widest flex items-center justify-center space-x-1.5 shadow-sm mt-3 uppercase"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={13} />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <span>Register</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

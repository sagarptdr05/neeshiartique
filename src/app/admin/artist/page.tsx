'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Package,
  ShoppingBag,
  Percent,
  LogOut,
  User,
  Home,
  Loader2,
  FileText,
  Mail,
  Sparkles,
  Save,
  MapPin,
  Upload,
  ArrowRight,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

export default function AdminArtistProfile() {
  const router = useRouter();
  const { logout } = useStore();
  const [authorized, setAuthorized] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  
  // Form states
  const [name, setName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [shortIntro, setShortIntro] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  
  const [storyChildhood, setStoryChildhood] = useState('');
  const [storyEngineering, setStoryEngineering] = useState('');
  const [storyYoutube, setStoryYoutube] = useState('');
  const [storyFriendGift, setStoryFriendGift] = useState('');
  const [storyChatgpt, setStoryChatgpt] = useState('');
  const [storyFavourites, setStoryFavourites] = useState('');
  const [storyTime, setStoryTime] = useState('');
  const [storyProcess, setStoryProcess] = useState('');
  const [storyFuture, setStoryFuture] = useState('');
  const [storySignature, setStorySignature] = useState('');

  // UI States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavUrl, setPendingNavUrl] = useState('');

  // Auth & Session Check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (res.ok && data.authenticated && data.user.role === 'admin') {
          setAuthorized(true);
          setAdminUser(data.user);
        } else {
          router.push('/login?redirect=/admin/artist');
        }
      } catch (err) {
        console.error('Artist profile auth check failed:', err);
        router.push('/login?redirect=/admin/artist');
      }
    };
    checkAuth();
  }, [router]);

  // Load Artist Profile
  useEffect(() => {
    if (!authorized) return;

    const fetchArtist = async () => {
      try {
        const res = await fetch('/api/artist');
        const data = await res.json();
        if (res.ok && data.success && data.artist) {
          const a = data.artist;
          setName(a.name || '');
          setProfilePhoto(a.profile_photo || '');
          setShortIntro(a.short_intro || '');
          setEmail(a.email || '');
          setLocation(a.location || '');
          setStoryChildhood(a.story_childhood || '');
          setStoryEngineering(a.story_engineering || '');
          setStoryYoutube(a.story_youtube || '');
          setStoryFriendGift(a.story_friend_gift || '');
          setStoryChatgpt(a.story_chatgpt || '');
          setStoryFavourites(a.story_favourites || '');
          setStoryTime(a.story_time || '');
          setStoryProcess(a.story_process || '');
          setStoryFuture(a.story_future || '');
          setStorySignature(a.story_signature || '');
        }
      } catch (err) {
        console.error('Failed to fetch artist profile config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtist();
  }, [authorized]);

  // Prevent accidental navigate away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Intercept local sidebar nav
  const handleNav = (url: string) => {
    if (isDirty) {
      setPendingNavUrl(url);
      setShowUnsavedModal(true);
    } else {
      router.push(url);
    }
  };

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'artist-images');

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfilePhoto(data.url);
        setIsDirty(true);
      } else {
        alert(data.message || 'Failed to upload photo.');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Please check file properties.');
    } finally {
      setUploading(false);
    }
  };

  // Submit/Save changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus('idle');

    try {
      const res = await fetch('/api/artist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          profile_photo: profilePhoto,
          short_intro: shortIntro,
          email,
          location,
          story_childhood: storyChildhood,
          story_engineering: storyEngineering,
          story_youtube: storyYoutube,
          story_friend_gift: storyFriendGift,
          story_chatgpt: storyChatgpt,
          story_favourites: storyFavourites,
          story_time: storyTime,
          story_process: storyProcess,
          story_future: storyFuture,
          story_signature: storySignature,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus('success');
        setIsDirty(false);
        setTimeout(() => setSaveStatus('idle'), 4000);
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleAdminLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-cream text-brand-cocoa space-y-3 font-serif italic">
        <Loader2 className="animate-spin text-brand-rose" size={28} />
        <span>Verifying admin authorization... ♡</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream/20">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 flex-shrink-0 flex flex-col space-y-6">
          <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-4 shadow-sm space-y-4">
            {/* Sidebar User Header */}
            <div className="flex items-center space-x-3 pb-3 border-b border-brand-beige/50">
              <div className="p-2.5 bg-brand-rose/10 text-brand-rose rounded-full">
                <User size={18} />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-brand-cocoa uppercase tracking-wider truncate">
                  {adminUser?.name || 'Administrator'}
                </p>
                <p className="text-[10px] text-brand-cocoa/60 font-medium truncate">
                  {adminUser?.email || 'admin@neeshiartique.com'}
                </p>
              </div>
            </div>

            {/* Sidebar Menu Groups */}
            <nav className="space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-brand-cocoa/40 uppercase tracking-widest block pl-2 mb-1.5">
                  Dashboard
                </span>
                <button
                  onClick={() => handleNav('/admin')}
                  className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose"
                >
                  <Home size={14} />
                  <span>Overview</span>
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-brand-cocoa/40 uppercase tracking-widest block pl-2 mb-1.5">
                  Store Management
                </span>
                <button
                  onClick={() => handleNav('/admin')}
                  className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose"
                >
                  <Package size={14} />
                  <span>Products</span>
                </button>
                <button
                  onClick={() => handleNav('/admin')}
                  className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose"
                >
                  <ShoppingBag size={14} />
                  <span>Orders</span>
                </button>
                <button
                  onClick={() => handleNav('/admin/orders/completed')}
                  className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose"
                >
                  <CheckCircle2 size={14} />
                  <span>Completed Orders</span>
                </button>
                <button
                  onClick={() => handleNav('/admin')}
                  className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose"
                >
                  <Sparkles size={14} />
                  <span>Custom Requests</span>
                </button>
                <button
                  onClick={() => handleNav('/admin')}
                  className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose"
                >
                  <Mail size={14} />
                  <span>Messages</span>
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-brand-cocoa/40 uppercase tracking-widest block pl-2 mb-1.5">
                  Marketing
                </span>
                <button
                  onClick={() => handleNav('/admin')}
                  className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose"
                >
                  <Percent size={14} />
                  <span>Coupons</span>
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-brand-cocoa/40 uppercase tracking-widest block pl-2 mb-1.5">
                  Website Content
                </span>
                <button
                  onClick={() => handleNav('/admin/homepage')}
                  className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose"
                >
                  <FileText size={14} />
                  <span>Homepage</span>
                </button>
                <button
                  onClick={() => handleNav('/admin/artist')}
                  className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all bg-brand-rose text-brand-cream shadow-sm"
                >
                  <User size={14} />
                  <span>Artist Profile</span>
                </button>
              </div>
            </nav>

            <div className="pt-3 border-t border-brand-beige/50">
              <button
                onClick={handleAdminLogout}
                className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* WORKSPACE CONTENT */}
        <section className="flex-grow space-y-6">
          <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-brand-cocoa">Artist Profile</h2>
            <p className="text-xs text-brand-cocoa/70 mt-1">
              Manage your biographical stories, contact info, photo, and other details.
            </p>
          </div>

          {loading ? (
            <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-12 flex items-center justify-center">
              <Loader2 className="animate-spin text-brand-rose" size={24} />
            </div>
          ) : (
            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form inputs left */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Basic Metadata Card */}
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-brand-cocoa uppercase tracking-wider border-b border-brand-beige/50 pb-2">
                    1. Basic Profile
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Artist Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
                        className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-2 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Location *</label>
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => { setLocation(e.target.value); setIsDirty(true); }}
                        className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-2 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Contact Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setIsDirty(true); }}
                      className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-2 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Short Introduction Quote (Hero block) *</label>
                    <textarea
                      required
                      rows={3}
                      value={shortIntro}
                      onChange={(e) => { setShortIntro(e.target.value); setIsDirty(true); }}
                      className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-2 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa leading-relaxed"
                    />
                  </div>

                  {/* Photo Uploader */}
                  <div className="space-y-2.5 pt-2">
                    <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Profile Portrait Photo *</label>
                    <div className="flex items-center space-x-4">
                      <div className="relative w-16 h-16 rounded border border-brand-beige bg-brand-cream overflow-hidden">
                        {profilePhoto ? (
                          <Image src={profilePhoto} alt="Preview" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand-cocoa/30 text-xs">No img</div>
                        )}
                      </div>
                      <div className="flex-grow space-y-1">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            id="photo-upload-input"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            disabled={uploading}
                            onClick={() => document.getElementById('photo-upload-input')?.click()}
                            className="bg-brand-cream border border-brand-beige text-brand-cocoa hover:bg-brand-beige text-xs font-semibold py-2 px-4 rounded flex items-center space-x-2 transition-all shadow-sm"
                          >
                            <Upload size={12} />
                            <span>{uploading ? 'Uploading Photo...' : 'Upload Photo'}</span>
                          </button>
                        </div>
                        <p className="text-[9px] text-brand-cocoa/50">PNG, JPG, WEBP formats up to 5MB.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Editorial Biography Chapters */}
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-brand-cocoa uppercase tracking-wider border-b border-brand-beige/50 pb-2">
                    2. Editorial Biography Chapters
                  </h3>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Chapter 1: Childhood Art Interest *</label>
                      <textarea
                        required
                        rows={3}
                        value={storyChildhood}
                        onChange={(e) => { setStoryChildhood(e.target.value); setIsDirty(true); }}
                        className="w-full bg-brand-cream border border-brand-beige rounded p-3 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Chapter 2: Engineering & Crochet Beginnings *</label>
                      <textarea
                        required
                        rows={3}
                        value={storyEngineering}
                        onChange={(e) => { setStoryEngineering(e.target.value); setIsDirty(true); }}
                        className="w-full bg-brand-cream border border-brand-beige rounded p-3 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">YouTube Learning Context *</label>
                      <textarea
                        required
                        rows={2}
                        value={storyYoutube}
                        onChange={(e) => { setStoryYoutube(e.target.value); setIsDirty(true); }}
                        className="w-full bg-brand-cream border border-brand-beige rounded p-3 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Chapter 3: Best Friend's Gift Story *</label>
                      <textarea
                        required
                        rows={3}
                        value={storyFriendGift}
                        onChange={(e) => { setStoryFriendGift(e.target.value); setIsDirty(true); }}
                        className="w-full bg-brand-cream border border-brand-beige rounded p-3 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Chapter 4: Launching / ChatGPT Decision *</label>
                      <textarea
                        required
                        rows={3}
                        value={storyChatgpt}
                        onChange={(e) => { setStoryChatgpt(e.target.value); setIsDirty(true); }}
                        className="w-full bg-brand-cream border border-brand-beige rounded p-3 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Creative Details & Signature */}
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-brand-cocoa uppercase tracking-wider border-b border-brand-beige/50 pb-2">
                    3. Creative Details & Signature
                  </h3>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Favourite Products Motivation *</label>
                      <textarea
                        required
                        rows={2}
                        value={storyFavourites}
                        onChange={(e) => { setStoryFavourites(e.target.value); setIsDirty(true); }}
                        className="w-full bg-brand-cream border border-brand-beige rounded p-3 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Time & Crafting Philosophy *</label>
                      <textarea
                        required
                        rows={3}
                        value={storyTime}
                        onChange={(e) => { setStoryTime(e.target.value); setIsDirty(true); }}
                        className="w-full bg-brand-cream border border-brand-beige rounded p-3 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Process Flow Steps (delimited with ➔) *</label>
                      <input
                        type="text"
                        required
                        value={storyProcess}
                        onChange={(e) => { setStoryProcess(e.target.value); setIsDirty(true); }}
                        className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-2 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                      />
                      <p className="text-[9px] text-brand-cocoa/50">Example: Step 1 ➔ Step 2 ➔ Step 3</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Future Crochet Dreams *</label>
                      <textarea
                        required
                        rows={3}
                        value={storyFuture}
                        onChange={(e) => { setStoryFuture(e.target.value); setIsDirty(true); }}
                        className="w-full bg-brand-cream border border-brand-beige rounded p-3 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Personal closing signature *</label>
                      <textarea
                        required
                        rows={3}
                        value={storySignature}
                        onChange={(e) => { setStorySignature(e.target.value); setIsDirty(true); }}
                        className="w-full bg-brand-cream border border-brand-beige rounded p-3 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                      />
                    </div>
                  </div>
                </div>

                {/* Sticky Action Footer */}
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-4 shadow-sm flex items-center justify-between">
                  <div className="text-xs">
                    {isDirty ? (
                      <span className="text-amber-700 flex items-center gap-1.5 font-medium">
                        <AlertTriangle size={12} />
                        <span>Unsaved Changes</span>
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium">Synced with database ♡</span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-brand-rose hover:bg-brand-cocoa text-brand-cream text-xs font-bold py-2.5 px-6 rounded flex items-center space-x-2 transition-colors shadow-sm"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={14} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>

                {saveStatus === 'success' && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3.5 rounded text-center font-bold">
                    Artist Profile updated successfully. ♡
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-3.5 rounded text-center font-bold">
                    We couldn't save your changes. Please try again.
                  </div>
                )}

              </div>

              {/* Visual Preview Right */}
              <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-6">
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 shadow-sm space-y-6">
                  <h3 className="text-xs font-bold text-brand-cocoa uppercase tracking-wider border-b border-brand-beige/50 pb-2">
                    Live Component Previews
                  </h3>

                  {/* 1. Homepage Meet the Artist Block Mockup */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-brand-rose uppercase tracking-wider block">1. Homepage Section Preview</span>
                    <div className="border border-brand-beige/70 bg-brand-cream/30 p-4 rounded-lg space-y-4">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="relative w-20 h-24 rounded border border-brand-beige overflow-hidden bg-brand-cream shadow-sm">
                          {profilePhoto && <Image src={profilePhoto} alt="Portrait" fill className="object-cover" />}
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-brand-rose uppercase tracking-widest">Meet the Creator</span>
                          <h4 className="font-serif text-sm font-bold text-brand-cocoa">The Hands Behind the Yarn. 🧶</h4>
                          <p className="text-[10px] text-brand-cocoa/80 leading-relaxed line-clamp-3 px-2">
                            {shortIntro || 'Hi, I’m Neeshita, the hands behind the yarn...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Artist Bio Header Preview */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-brand-rose uppercase tracking-wider block">2. Bio Header Banner</span>
                    <div className="border border-brand-beige/70 bg-brand-cream/30 p-4 rounded-lg text-center space-y-3">
                      <h4 className="font-serif text-base font-bold text-brand-cocoa">{name || 'Artist Name'}</h4>
                      <div className="flex flex-wrap items-center justify-center gap-2 text-[9px] font-bold text-brand-cocoa/70 bg-brand-beige/35 py-1.5 px-3 rounded-full border border-brand-beige/40">
                        <span className="flex items-center space-x-0.5"><MapPin size={9} className="text-brand-rose" /> <span>{location || 'Mumbai, India'}</span></span>
                        <span>|</span>
                        <span className="flex items-center space-x-0.5"><Mail size={9} className="text-brand-rose" /> <span>{email || 'email@email.com'}</span></span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </form>
          )}

        </section>
      </main>

      <Footer />

      {/* UNSAVED CHANGES MODAL */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-cocoa/50 backdrop-blur-xs">
          <div className="bg-brand-cream border border-brand-beige rounded-lg p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-serif text-base font-bold text-brand-cocoa flex items-center gap-2">
              <AlertTriangle className="text-brand-rose" size={18} />
              <span>You have unsaved changes!</span>
            </h3>
            <p className="text-xs text-brand-cocoa/80 leading-relaxed">
              Are you sure you want to leave this page? Any modifications to your Artist Profile content will be lost.
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowUnsavedModal(false)}
                className="flex-1 bg-brand-cream border border-brand-beige text-brand-cocoa hover:bg-brand-beige text-xs font-semibold py-2.5 rounded transition-all"
              >
                Continue Editing
              </button>
              <button
                onClick={() => {
                  setIsDirty(false);
                  setShowUnsavedModal(false);
                  router.push(pendingNavUrl);
                }}
                className="flex-1 bg-brand-rose text-brand-cream hover:bg-brand-cocoa text-xs font-semibold py-2.5 rounded transition-all"
              >
                Leave Without Saving
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

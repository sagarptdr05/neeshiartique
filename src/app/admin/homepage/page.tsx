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
  Sparkles,
  Save,
  Upload,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Mail
} from 'lucide-react';

export default function AdminHomepageContent() {
  const router = useRouter();
  const { products, logout } = useStore();
  const [authorized, setAuthorized] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Form Content States
  const [heroHeading, setHeroHeading] = useState('');
  const [heroDescription, setHeroDescription] = useState('');
  const [heroImagePath, setHeroImagePath] = useState('');
  const [heroCtaText, setHeroCtaText] = useState('');
  const [heroCtaLink, setHeroCtaLink] = useState('');
  
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);
  const [announcementLink, setAnnouncementLink] = useState('');

  const [featuredSectionHeading, setFeaturedSectionHeading] = useState('');
  const [featuredSectionDescription, setFeaturedSectionDescription] = useState('');
  const [latestSectionHeading, setLatestSectionHeading] = useState('');
  const [latestSectionDescription, setLatestSectionDescription] = useState('');

  const [customCtaHeading, setCustomCtaHeading] = useState('');
  const [customCtaDescription, setCustomCtaDescription] = useState('');

  const [videoHeading, setVideoHeading] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPosterPath, setVideoPosterPath] = useState('');
  const [videoCaption, setVideoCaption] = useState('');

  const [visibility, setVisibility] = useState<Record<string, boolean>>({
    hero: true,
    announcement: true,
    featured: true,
    artist: true,
    video: true,
    latest: true,
    custom_cta: true,
    instagram: true
  });

  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<string[]>([]);
  const [latestProducts, setLatestProducts] = useState<string[]>([]);

  // Artist preview state
  const [artistPreview, setArtistPreview] = useState<any>(null);

  // UI States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavUrl, setPendingNavUrl] = useState('');

  // Dropdown select state for adding products
  const [selectedFeaturedAdd, setSelectedFeaturedAdd] = useState('');
  const [selectedLatestAdd, setSelectedLatestAdd] = useState('');

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
          router.push('/login?redirect=/admin/homepage');
        }
      } catch (err) {
        console.error('Homepage auth check failed:', err);
        router.push('/login?redirect=/admin/homepage');
      }
    };
    checkAuth();
  }, [router]);

  // Load Homepage CMS content & Artist info for preview
  useEffect(() => {
    if (!authorized) return;

    const loadCms = async () => {
      try {
        const [hpRes, artRes] = await Promise.all([
          fetch('/api/homepage'),
          fetch('/api/artist')
        ]);
        const [hpJson, artJson] = await Promise.all([
          hpRes.json(),
          artRes.json()
        ]);

        if (hpRes.ok && hpJson.success && hpJson.homepage) {
          const hp = hpJson.homepage;
          setHeroHeading(hp.hero_heading || '');
          setHeroDescription(hp.hero_description || '');
          setHeroImagePath(hp.hero_image_path || '');
          setHeroCtaText(hp.hero_cta_text || '');
          setHeroCtaLink(hp.hero_cta_link || '');
          setAnnouncementText(hp.announcement_text || '');
          setAnnouncementEnabled(hp.announcement_enabled !== false);
          setAnnouncementLink(hp.announcement_link || '');
          setFeaturedSectionHeading(hp.featured_section_heading || '');
          setFeaturedSectionDescription(hp.featured_section_description || '');
          setLatestSectionHeading(hp.latest_section_heading || '');
          setLatestSectionDescription(hp.latest_section_description || '');
          setCustomCtaHeading(hp.custom_cta_heading || '');
          setCustomCtaDescription(hp.custom_cta_description || '');
          setVideoHeading(hp.video_heading || 'How Crochet Is Made');
          setVideoDescription(hp.video_description || '');
          setVideoUrl(hp.video_url || '');
          setVideoPosterPath(hp.video_poster_path || '');
          setVideoCaption(hp.video_caption || '');
          setVisibility(hp.section_visibility || {
            hero: true,
            announcement: true,
            featured: true,
            artist: true,
            video: true,
            latest: true,
            custom_cta: true,
            instagram: true
          });
          setSectionOrder(hp.section_order || ['hero', 'announcement', 'latest', 'featured', 'artist', 'video', 'custom_cta', 'instagram']);
          setFeaturedProducts(hp.featured_products || []);
          setLatestProducts(hp.latest_products || []);
        }

        if (artRes.ok && artJson.success) {
          setArtistPreview(artJson.artist);
        }
      } catch (err) {
        console.error('Failed to load homepage CMS config:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCms();
  }, [authorized]);

  // Handle unload warnings
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

  const handleNav = (url: string) => {
    if (isDirty) {
      setPendingNavUrl(url);
      setShowUnsavedModal(true);
    } else {
      router.push(url);
    }
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'homepage-images');

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setHeroImagePath(data.url);
        setIsDirty(true);
      } else {
        alert(data.message || 'Failed to upload hero image.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed. Verify image format.');
    } finally {
      setUploading(false);
    }
  };

  // Generic uploader for the video section's file + poster image
  const uploadTo = async (
    file: File,
    bucket: string,
    onDone: (url: string) => void,
    label: string
  ) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.success) {
        onDone(data.url);
        setIsDirty(true);
      } else {
        alert(data.message || `Failed to upload ${label}.`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert(`Upload failed. If the ${label} is large, host it elsewhere and paste the URL instead.`);
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadTo(file, 'homepage-videos', setVideoUrl, 'video');
  };

  const handleVideoPosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadTo(file, 'homepage-images', setVideoPosterPath, 'thumbnail');
  };

  // Section Ordering actions
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrder];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;
    setSectionOrder(newOrder);
    setIsDirty(true);
  };

  // Visibility toggle
  const toggleVisibility = (key: string) => {
    setVisibility(prev => {
      const next = { ...prev, [key]: !prev[key] };
      setIsDirty(true);
      return next;
    });
  };

  // Add product relationships
  const addFeaturedProduct = () => {
    if (!selectedFeaturedAdd || featuredProducts.includes(selectedFeaturedAdd)) return;
    setFeaturedProducts([...featuredProducts, selectedFeaturedAdd]);
    setSelectedFeaturedAdd('');
    setIsDirty(true);
  };

  const removeFeaturedProduct = (pId: string) => {
    setFeaturedProducts(featuredProducts.filter(id => id !== pId));
    setIsDirty(true);
  };

  const reorderFeaturedProduct = (index: number, direction: 'up' | 'down') => {
    const newItems = [...featuredProducts];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[target];
    newItems[target] = temp;
    setFeaturedProducts(newItems);
    setIsDirty(true);
  };

  // Latest products
  const addLatestProduct = () => {
    if (!selectedLatestAdd || latestProducts.includes(selectedLatestAdd)) return;
    setLatestProducts([...latestProducts, selectedLatestAdd]);
    setSelectedLatestAdd('');
    setIsDirty(true);
  };

  const removeLatestProduct = (pId: string) => {
    setLatestProducts(latestProducts.filter(id => id !== pId));
    setIsDirty(true);
  };

  const reorderLatestProduct = (index: number, direction: 'up' | 'down') => {
    const newItems = [...latestProducts];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[target];
    newItems[target] = temp;
    setLatestProducts(newItems);
    setIsDirty(true);
  };

  // Submit Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus('idle');

    try {
      const res = await fetch('/api/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hero_heading: heroHeading,
          hero_description: heroDescription,
          hero_image_path: heroImagePath,
          hero_cta_text: heroCtaText,
          hero_cta_link: heroCtaLink,
          announcement_text: announcementText,
          announcement_enabled: announcementEnabled,
          announcement_link: announcementLink,
          featured_section_heading: featuredSectionHeading,
          featured_section_description: featuredSectionDescription,
          latest_section_heading: latestSectionHeading,
          latest_section_description: latestSectionDescription,
          custom_cta_heading: customCtaHeading,
          custom_cta_description: customCtaDescription,
          video_heading: videoHeading,
          video_description: videoDescription,
          video_url: videoUrl,
          video_poster_path: videoPosterPath,
          video_caption: videoCaption,
          section_visibility: visibility,
          section_order: sectionOrder,
          featured_products: featuredProducts,
          latest_products: latestProducts
        })
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

  // Lookups helper
  const getProductTitle = (id: string) => {
    return products.find(p => p.id === id)?.name || id;
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
                  Website Content
                </span>
                <button
                  onClick={() => handleNav('/admin/homepage')}
                  className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold bg-brand-rose text-brand-cream shadow-sm"
                >
                  <FileText size={14} />
                  <span>Homepage</span>
                </button>
                <button
                  onClick={() => handleNav('/admin/artist')}
                  className="w-full flex items-center space-x-2.5 py-2 px-3 rounded text-xs font-bold transition-all text-brand-cocoa/80 hover:bg-brand-beige/20 hover:text-brand-rose"
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
            <h2 className="font-serif text-2xl font-bold text-brand-cocoa">Homepage</h2>
            <p className="text-xs text-brand-cocoa/70 mt-1">
              Manage the content and sections displayed on the Neeshiartique homepage.
            </p>
          </div>

          {loading ? (
            <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-12 flex items-center justify-center">
              <Loader2 className="animate-spin text-brand-rose" size={24} />
            </div>
          ) : (
            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Config Left */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. Announcement Bar Settings */}
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-brand-beige/50 pb-2">
                    <h3 className="text-xs font-bold text-brand-cocoa uppercase tracking-wider">
                      1. Announcement Bar
                    </h3>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={announcementEnabled}
                        onChange={(e) => { setAnnouncementEnabled(e.target.checked); setIsDirty(true); }}
                        className="rounded text-brand-rose border-brand-beige focus:ring-brand-rose w-3.5 h-3.5"
                      />
                      <span className="text-[10px] font-bold text-brand-cocoa/80 uppercase">Enabled</span>
                    </label>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Announcement Text *</label>
                      <input
                        type="text"
                        required
                        value={announcementText}
                        onChange={(e) => { setAnnouncementText(e.target.value); setIsDirty(true); }}
                        className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-2 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Optional Target Link</label>
                      <input
                        type="text"
                        value={announcementLink}
                        onChange={(e) => { setAnnouncementLink(e.target.value); setIsDirty(true); }}
                        placeholder="e.g. /shop or /custom-orders"
                        className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-2 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa placeholder-brand-cocoa/40"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Hero Section Settings */}
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-brand-cocoa uppercase tracking-wider border-b border-brand-beige/50 pb-2">
                    2. Hero Banner Content
                  </h3>

                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Hero Main Heading *</label>
                      <input
                        type="text"
                        required
                        value={heroHeading}
                        onChange={(e) => { setHeroHeading(e.target.value); setIsDirty(true); }}
                        className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-2 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Supporting Description Text *</label>
                      <textarea
                        required
                        rows={3}
                        value={heroDescription}
                        onChange={(e) => { setHeroDescription(e.target.value); setIsDirty(true); }}
                        className="w-full bg-brand-cream border border-brand-beige rounded p-3 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">CTA Button Text *</label>
                        <input
                          type="text"
                          required
                          value={heroCtaText}
                          onChange={(e) => { setHeroCtaText(e.target.value); setIsDirty(true); }}
                          className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-2 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">CTA Button Link *</label>
                        <input
                          type="text"
                          required
                          value={heroCtaLink}
                          onChange={(e) => { setHeroCtaLink(e.target.value); setIsDirty(true); }}
                          className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-2 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                        />
                      </div>
                    </div>

                    {/* Hero Image Uploader */}
                    <div className="space-y-2.5 pt-1">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Hero Image File *</label>
                      <div className="flex items-center space-x-4">
                        <div className="relative w-16 h-20 rounded border border-brand-beige bg-brand-cream overflow-hidden">
                          {heroImagePath ? (
                            <Image src={heroImagePath} alt="Preview" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-brand-cocoa/30 text-xs">No img</div>
                          )}
                        </div>
                        <div className="flex-grow space-y-1">
                          <input
                            type="file"
                            accept="image/*"
                            id="hero-photo-input"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            disabled={uploading}
                            onClick={() => document.getElementById('hero-photo-input')?.click()}
                            className="bg-brand-cream border border-brand-beige text-brand-cocoa hover:bg-brand-beige text-xs font-semibold py-2 px-4 rounded flex items-center space-x-2 transition-all shadow-sm"
                          >
                            <Upload size={12} />
                            <span>{uploading ? 'Uploading Image...' : 'Change Image'}</span>
                          </button>
                          <p className="text-[9px] text-brand-cocoa/50">PNG, JPG, WEBP formats up to 5MB.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Featured Crochet Products */}
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-brand-cocoa uppercase tracking-wider border-b border-brand-beige/50 pb-2">
                    3. Featured Crochet Products
                  </h3>

                  <div className="grid grid-cols-2 gap-4 pb-2 border-b border-brand-beige/20">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Section Title *</label>
                      <input
                        type="text"
                        required
                        value={featuredSectionHeading}
                        onChange={(e) => { setFeaturedSectionHeading(e.target.value); setIsDirty(true); }}
                        className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-1.5 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Section Subtitle</label>
                      <input
                        type="text"
                        value={featuredSectionDescription}
                        onChange={(e) => { setFeaturedSectionDescription(e.target.value); setIsDirty(true); }}
                        className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-1.5 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                      />
                    </div>
                  </div>

                  {/* Add Product selectors */}
                  <div className="flex items-center space-x-3 bg-brand-cream/50 p-2.5 rounded border border-brand-beige/40">
                    <select
                      value={selectedFeaturedAdd}
                      onChange={(e) => setSelectedFeaturedAdd(e.target.value)}
                      className="flex-grow bg-brand-cream border border-brand-beige rounded px-3 py-1.5 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                    >
                      <option value="">-- Choose active product --</option>
                      {products
                        .filter(p => p.status === 'active' && !featuredProducts.includes(p.id))
                        .map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))
                      }
                    </select>
                    <button
                      type="button"
                      onClick={addFeaturedProduct}
                      className="bg-brand-rose hover:bg-brand-cocoa text-brand-cream text-xs font-bold py-1.5 px-3.5 rounded flex items-center space-x-1 transition-colors"
                    >
                      <Plus size={12} />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Products list with Up/Down buttons */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {featuredProducts.length === 0 ? (
                      <p className="text-[11px] text-brand-cocoa/50 text-center py-4 font-medium italic">No products in featured list. Defaults to Bestsellers.</p>
                    ) : (
                      featuredProducts.map((pId, idx) => (
                        <div key={pId} className="flex items-center justify-between bg-brand-cream border border-brand-beige/70 p-2 rounded text-xs">
                          <span className="font-semibold text-brand-cocoa truncate pr-2">
                            {idx + 1}. {getProductTitle(pId)}
                          </span>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => reorderFeaturedProduct(idx, 'up')}
                              className="p-1 hover:bg-brand-beige/30 text-brand-cocoa rounded disabled:opacity-30"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              disabled={idx === featuredProducts.length - 1}
                              onClick={() => reorderFeaturedProduct(idx, 'down')}
                              className="p-1 hover:bg-brand-beige/30 text-brand-cocoa rounded disabled:opacity-30"
                            >
                              <ArrowDown size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFeaturedProduct(pId)}
                              className="p-1 hover:bg-rose-50 text-rose-700 rounded ml-1"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 4. Latest Creations / Categories Headers */}
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-brand-cocoa uppercase tracking-wider border-b border-brand-beige/50 pb-2">
                    4. Explore / Categories Sections
                  </h3>

                  <div className="grid grid-cols-2 gap-4 pb-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Section Heading *</label>
                      <input
                        type="text"
                        required
                        value={latestSectionHeading}
                        onChange={(e) => { setLatestSectionHeading(e.target.value); setIsDirty(true); }}
                        className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-1.5 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Section Subtitle</label>
                      <input
                        type="text"
                        value={latestSectionDescription}
                        onChange={(e) => { setLatestSectionDescription(e.target.value); setIsDirty(true); }}
                        className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-1.5 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Custom Crochet CTA Content */}
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-brand-cocoa uppercase tracking-wider border-b border-brand-beige/50 pb-2">
                    5. Custom Request Banner Content
                  </h3>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">CTA Heading Banner *</label>
                      <input
                        type="text"
                        required
                        value={customCtaHeading}
                        onChange={(e) => { setCustomCtaHeading(e.target.value); setIsDirty(true); }}
                        className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-2 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">CTA Description Paragraph *</label>
                      <textarea
                        required
                        rows={2}
                        value={customCtaDescription}
                        onChange={(e) => { setCustomCtaDescription(e.target.value); setIsDirty(true); }}
                        className="w-full bg-brand-cream border border-brand-beige rounded p-3 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Homepage Video Section */}
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-brand-beige/50 pb-2">
                    <h3 className="text-xs font-bold text-brand-cocoa uppercase tracking-wider">
                      6. Homepage Video
                    </h3>
                    <span className="text-[10px] font-semibold text-brand-cocoa/50 normal-case">
                      Hidden until a video is set
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Video Section Heading</label>
                      <input
                        type="text"
                        value={videoHeading}
                        onChange={(e) => { setVideoHeading(e.target.value); setIsDirty(true); }}
                        placeholder="How Crochet Is Made"
                        className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-2 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa placeholder-brand-cocoa/40"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Supporting Description</label>
                      <textarea
                        rows={2}
                        value={videoDescription}
                        onChange={(e) => { setVideoDescription(e.target.value); setIsDirty(true); }}
                        placeholder="A little look at the craft behind every handmade piece."
                        className="w-full bg-brand-cream border border-brand-beige rounded p-3 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa leading-relaxed placeholder-brand-cocoa/40"
                      />
                    </div>

                    {/* Video source: paste a URL, or upload a small file */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Video URL</label>
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => { setVideoUrl(e.target.value); setIsDirty(true); }}
                        placeholder="/videos/uploads/making.mp4 or https://..."
                        className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-2 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa placeholder-brand-cocoa/40"
                      />
                      <p className="text-[10px] text-brand-cocoa/55 leading-relaxed">
                        Paste a direct link to an MP4/WEBM file, or upload one below. Large files are
                        better hosted elsewhere and pasted here as a link.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        id="homepage-video-input"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={uploading}
                        onClick={() => document.getElementById('homepage-video-input')?.click()}
                        className="inline-flex items-center gap-1.5 border border-brand-beige bg-brand-cream hover:bg-brand-beige/40 disabled:opacity-60 text-brand-cocoa transition-colors text-[10px] font-bold uppercase tracking-wider py-2 px-4 rounded"
                      >
                        {uploading ? <Loader2 className="animate-spin" size={12} /> : <Upload size={12} />}
                        <span>Upload Video (max 25MB)</span>
                      </button>
                      {videoUrl && (
                        <button
                          type="button"
                          onClick={() => { setVideoUrl(''); setIsDirty(true); }}
                          className="inline-flex items-center gap-1.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors text-[10px] font-bold uppercase tracking-wider py-2 px-4 rounded"
                        >
                          <Trash2 size={12} />
                          <span>Remove Video</span>
                        </button>
                      )}
                    </div>

                    {/* Poster / thumbnail */}
                    <div className="space-y-2 pt-1">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Thumbnail Image (shown before play)</label>
                      <div className="flex items-center gap-4">
                        <div className="relative w-24 h-14 rounded border border-brand-beige bg-brand-cream overflow-hidden flex-shrink-0">
                          {videoPosterPath ? (
                            <Image src={videoPosterPath} alt="Video thumbnail preview" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-brand-cocoa/30 text-[10px]">No image</div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <input
                            type="file"
                            accept="image/*"
                            id="homepage-video-poster-input"
                            onChange={handleVideoPosterUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            disabled={uploading}
                            onClick={() => document.getElementById('homepage-video-poster-input')?.click()}
                            className="inline-flex items-center gap-1.5 border border-brand-beige bg-brand-cream hover:bg-brand-beige/40 disabled:opacity-60 text-brand-cocoa transition-colors text-[10px] font-bold uppercase tracking-wider py-2 px-4 rounded"
                          >
                            {uploading ? <Loader2 className="animate-spin" size={12} /> : <Upload size={12} />}
                            <span>Upload Thumbnail</span>
                          </button>
                          <p className="text-[10px] text-brand-cocoa/55">Optional, but avoids a blank frame before play.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-brand-cocoa/70 uppercase tracking-wider block">Caption Below Video (Optional)</label>
                      <input
                        type="text"
                        value={videoCaption}
                        onChange={(e) => { setVideoCaption(e.target.value); setIsDirty(true); }}
                        placeholder="e.g. An illustrative look at the crochet process."
                        className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-2 text-xs focus:outline-none focus:border-brand-rose text-brand-cocoa placeholder-brand-cocoa/40"
                      />
                    </div>
                  </div>
                </div>

                {/* 7. Section Visibility Controls */}
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-brand-cocoa uppercase tracking-wider border-b border-brand-beige/50 pb-2">
                    7. Section Visibility
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.keys(visibility).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleVisibility(key)}
                        className={`flex items-center justify-between p-2.5 rounded border text-xs font-semibold capitalize transition-all ${
                          visibility[key]
                            ? 'bg-brand-cream border-brand-rose text-brand-rose shadow-xs'
                            : 'bg-brand-cream/40 border-brand-beige/60 text-brand-cocoa/50'
                        }`}
                      >
                        <span>{key.replace('_', ' ')}</span>
                        {visibility[key] ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 8. Section Display Order */}
                <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-brand-cocoa uppercase tracking-wider border-b border-brand-beige/50 pb-2">
                    8. Section Display Order
                  </h3>

                  <div className="space-y-2">
                    {sectionOrder.map((sectionKey, idx) => (
                      <div key={sectionKey} className="flex items-center justify-between bg-brand-cream border border-brand-beige/70 p-2.5 rounded text-xs">
                        <span className="font-semibold capitalize text-brand-cocoa">
                          {idx + 1}. {sectionKey.replace('_', ' ')}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveSection(idx, 'up')}
                            className="p-1 hover:bg-brand-beige/30 text-brand-cocoa rounded disabled:opacity-30"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === sectionOrder.length - 1}
                            onClick={() => moveSection(idx, 'down')}
                            className="p-1 hover:bg-brand-beige/30 text-brand-cocoa rounded disabled:opacity-30"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
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
                    Homepage updated successfully. ♡
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
                    Homepage Mockup Preview
                  </h3>

                  {/* Hero Block Preview */}
                  {visibility.hero && (
                    <div className="border border-brand-beige/70 bg-brand-cream/30 p-4 rounded-lg space-y-3.5">
                      <span className="text-[9px] font-bold text-brand-rose uppercase tracking-wider block">Hero Section</span>
                      <div className="space-y-2">
                        <h4 className="font-serif text-sm font-bold text-brand-cocoa leading-tight">{heroHeading || 'Little Things, Crocheted With Love.'}</h4>
                        <p className="text-[10px] text-brand-cocoa/75 leading-relaxed">{heroDescription || 'Description paragraph...'}</p>
                        <div className="flex items-center space-x-2">
                          <span className="bg-brand-rose text-brand-cream text-[9px] font-bold py-1 px-3 rounded">{heroCtaText || 'Explore'}</span>
                          {heroImagePath && (
                            <div className="relative w-8 h-8 rounded border overflow-hidden">
                              <Image src={heroImagePath} alt="Preview" fill className="object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Featured Products List */}
                  {visibility.featured && (
                    <div className="border border-brand-beige/70 bg-brand-cream/30 p-4 rounded-lg space-y-2">
                      <span className="text-[9px] font-bold text-brand-rose uppercase tracking-wider block">Featured Section: {featuredSectionHeading || 'Made With Love'}</span>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {featuredProducts.map((pId) => (
                          <div key={pId} className="text-[10px] font-medium text-brand-cocoa/80 truncate">
                            • {getProductTitle(pId)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meet the Artist block */}
                  {visibility.artist && artistPreview && (
                    <div className="border border-brand-beige/70 bg-brand-cream/30 p-4 rounded-lg space-y-2">
                      <span className="text-[9px] font-bold text-brand-rose uppercase tracking-wider block">Meet the Artist Section</span>
                      <div className="flex items-center space-x-2">
                        <div className="relative w-8 h-10 rounded border overflow-hidden flex-shrink-0">
                          <Image src={artistPreview.profile_photo} alt="Artist" fill className="object-cover" />
                        </div>
                        <div className="truncate">
                          <h5 className="font-serif text-[10px] font-bold text-brand-cocoa">{artistPreview.name}</h5>
                          <p className="text-[9px] text-brand-cocoa/70 truncate">{artistPreview.short_intro}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Custom CTA block */}
                  {visibility.custom_cta && (
                    <div className="border border-brand-beige/70 bg-brand-rose/20 p-4 rounded-lg space-y-2">
                      <span className="text-[9px] font-bold text-brand-rose uppercase tracking-wider block">Custom Crochet CTA Banner</span>
                      <h4 className="font-serif text-[11px] font-bold text-brand-cocoa">{customCtaHeading}</h4>
                      <p className="text-[9px] text-brand-cocoa/75 leading-relaxed">{customCtaDescription}</p>
                    </div>
                  )}

                </div>
              </div>

            </form>
          )}

        </section>
      </main>

      <Footer />

      {/* UNSAVED CHANGES WARNING MODAL */}
      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-cocoa/50 backdrop-blur-xs">
          <div className="bg-brand-cream border border-brand-beige rounded-lg p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="font-serif text-base font-bold text-brand-cocoa flex items-center gap-2">
              <AlertTriangle className="text-brand-rose" size={18} />
              <span>You have unsaved changes!</span>
            </h3>
            <p className="text-xs text-brand-cocoa/80 leading-relaxed">
              Are you sure you want to leave this page? Any modifications to your homepage configurations will be lost.
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

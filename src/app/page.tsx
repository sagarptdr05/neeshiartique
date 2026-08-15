'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Award, Gift, Calendar, Heart, Shield } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Product } from '@/data/mockData';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import QuickViewModal from '@/components/QuickViewModal';
import Footer from '@/components/Footer';

export default function Home() {
  const { products, categories } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [homepageData, setHomepageData] = useState<any>(null);
  const [artistData, setArtistData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load content configs on mount
  useEffect(() => {
    const loadCms = async () => {
      try {
        const [hpRes, artRes] = await Promise.all([
          fetch('/api/homepage'),
          fetch('/api/artist'),
        ]);
        const [hpJson, artJson] = await Promise.all([
          hpRes.json(),
          artRes.json(),
        ]);
        if (hpRes.ok && hpJson.success) setHomepageData(hpJson.homepage);
        if (artRes.ok && artJson.success) setArtistData(artJson.artist);
      } catch (err) {
        console.error('Failed to load CMS content for homepage:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCms();
  }, []);

  // Sections configuration
  const sectionOrder = homepageData?.section_order || ['hero', 'latest', 'featured', 'artist', 'custom_cta', 'instagram'];
  const visibility = homepageData?.section_visibility || {
    hero: true,
    announcement: true,
    featured: true,
    artist: true,
    latest: true,
    custom_cta: true,
    instagram: true,
  };

  // Build dynamic featured products list based on database selections
  const featuredProductsList = products
    .filter((p) => {
      if (homepageData?.featured_products && Array.isArray(homepageData.featured_products)) {
        return homepageData.featured_products.includes(p.id) && p.status === 'active';
      }
      // Default fallback
      return p.bestseller && p.status === 'active';
    })
    .slice(0, 8);

  const renderSection = (sectionKey: string) => {
    if (!visibility[sectionKey]) return null;

    switch (sectionKey) {
      case 'hero': {
        const heading = homepageData?.hero_heading || 'Little Things, Crocheted With Love.';
        const description = homepageData?.hero_description || 'Handmade crochet creations, thoughtful gifts and custom pieces — made one stitch at a time.';
        const image = homepageData?.hero_image_path || '/images/butterfly_keychain.jpg';
        const ctaText = homepageData?.hero_cta_text || 'Shop Crochet';
        const ctaLink = homepageData?.hero_cta_link || '/shop';

        return (
          <section key="hero" className="relative overflow-hidden bg-brand-cream py-16 lg:py-24 border-b border-brand-beige/30">
            {/* Floating background decorative details */}
            <div className="absolute top-10 left-10 text-brand-rose/25 animate-float select-none pointer-events-none text-2xl font-serif">✿</div>
            <div className="absolute bottom-20 right-16 text-brand-rose/20 animate-float select-none pointer-events-none text-3xl font-serif" style={{ animationDelay: '2s' }}>❀</div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Hero Left Content */}
              <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 bg-brand-blush/30 border border-brand-blush/60 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-brand-rose">
                  <Sparkles size={12} />
                  <span>Handmade with Love</span>
                </div>

                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-brand-cocoa leading-[1.1] whitespace-pre-line">
                  {heading}
                </h1>

                <p className="text-base sm:text-lg text-brand-cocoa/85 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {description}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link
                    href={ctaLink}
                    className="w-full sm:w-auto bg-brand-rose text-brand-cream hover:bg-brand-cocoa transition-colors text-sm font-semibold tracking-wide py-3.5 px-8 rounded flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <span>{ctaText}</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/custom-orders"
                    className="w-full sm:w-auto bg-brand-offwhite text-brand-cocoa hover:bg-brand-beige hover:border-brand-rose transition-colors text-sm font-semibold tracking-wide py-3.5 px-8 rounded border border-brand-beige flex items-center justify-center shadow-sm"
                  >
                    <span>Request Custom Crochet</span>
                  </Link>
                </div>
              </div>

              {/* Hero Right Collage */}
              <div className="lg:col-span-6 relative flex justify-center">
                <div className="grid grid-cols-12 gap-4 w-full max-w-lg">
                  {/* Large central item */}
                  <div className="col-span-8 relative aspect-[4/5] rounded-lg overflow-hidden border border-brand-beige shadow-md group bg-brand-beige/10">
                    <Image
                      src={image}
                      alt="Featured Hero Creation"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute bottom-3 left-3 bg-brand-cream/90 backdrop-blur-sm py-1 px-3.5 rounded text-[11px] font-bold text-brand-cocoa border border-brand-beige shadow-sm">
                      {heading.split(',')[0] || 'Handmade Crochet'}
                    </div>
                  </div>

                  {/* Smaller side items stacking */}
                  <div className="col-span-4 flex flex-col gap-4 justify-between">
                    <div className="relative aspect-square rounded-lg overflow-hidden border border-brand-beige shadow-sm group bg-brand-beige/10">
                      <Image
                        src="/images/pink_flower.png"
                        alt="Crochet Pink Blossom Hairclip"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="relative aspect-square rounded-lg overflow-hidden border border-brand-beige shadow-sm group bg-brand-beige/10">
                      <Image
                        src="/images/damru_keychain.jpg"
                        alt="Crochet Damru Keychain"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="relative aspect-square rounded-lg overflow-hidden border border-brand-beige shadow-sm group bg-brand-beige/10">
                      <Image
                        src="/images/red_bow_clips.jpg"
                        alt="Red Crochet Bow Clips"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      }

      case 'latest': {
        const heading = homepageData?.latest_section_heading || 'Explore Our Crochet';
        const description = homepageData?.latest_section_description || 'Shop by categories.';

        return (
          <section key="latest" className="py-16 sm:py-20 bg-brand-cream">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-cocoa mb-1">
                  {heading}
                </h2>
                {description && (
                  <p className="text-sm font-serif italic text-brand-rose mb-3">{description}</p>
                )}
                <div className="w-16 h-[1.5px] bg-brand-rose mx-auto" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={category.id === 'custom-crochet' ? '/custom-orders' : `/shop?category=${category.id}`}
                    className="group relative flex flex-col bg-brand-offwhite border border-brand-beige/50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 shadow-sm aspect-[3/4]"
                  >
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-cocoa/80 via-brand-cocoa/20 to-transparent flex flex-col justify-end p-4 transition-colors group-hover:via-brand-cocoa/30" />
                    <div className="absolute bottom-4 left-4 right-4 text-brand-cream z-10 transition-transform duration-300">
                      <h3 className="font-serif text-lg font-bold mb-1 group-hover:text-brand-blush flex items-center justify-between">
                        <span>{category.name}</span>
                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </h3>
                      <p className="text-[10px] text-brand-cream/80 font-medium line-clamp-2 font-sans">
                        {category.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case 'featured': {
        const heading = homepageData?.featured_section_heading || 'Made With Love';
        const description = homepageData?.featured_section_description || 'Some of our little favourites.';

        return (
          <section key="featured" className="py-16 sm:py-20 bg-brand-cream border-t border-brand-beige/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-cocoa mb-1">
                  {heading}
                </h2>
                {description && (
                  <p className="text-sm font-serif italic text-brand-rose mb-3">
                    {description}
                  </p>
                )}
                <div className="w-16 h-[1.5px] bg-brand-rose mx-auto" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                {featuredProductsList.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>

              <div className="text-center mt-12">
                <Link
                  href="/shop"
                  className="inline-flex items-center space-x-2 text-sm font-bold text-brand-cocoa hover:text-brand-rose border-b border-brand-cocoa hover:border-brand-rose pb-1 transition-all duration-200"
                >
                  <span>Explore All Creations</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </section>
        );
      }

      case 'artist': {
        const name = artistData?.name || 'Neeshita Prajapati';
        const portrait = artistData?.profile_photo || '/images/neeshita.jpg';
        const bio = artistData?.short_intro || 'Hi, I’m Neeshita, the hands behind the yarn. 🧶✨ Turning little loops into beautiful, handmade creations—one stitch, one idea, and one piece of love at a time. 💕';

        return (
          <section key="artist" className="py-16 sm:py-20 bg-brand-beige/10 border-t border-b border-brand-beige/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Portrait Image */}
                <div className="lg:col-span-5 relative aspect-[4/5] rounded-lg overflow-hidden border border-brand-beige shadow-md bg-brand-beige/10 group">
                  <Image
                    src={portrait}
                    alt={`${name} - Neeshiartique Artist`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-4 right-4 bg-brand-cream/90 border border-brand-beige px-4 py-2 rounded text-xs font-bold font-serif text-brand-cocoa shadow-sm">
                    {name} • Founder & Artist
                  </div>
                </div>

                {/* Bio content */}
                <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                  <span className="text-xs font-bold text-brand-rose tracking-widest uppercase">
                    Meet the Creator
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-cocoa leading-tight">
                    The Hands Behind the Yarn. 🧶
                  </h2>
                  <div className="w-16 h-[1.5px] bg-brand-rose mx-auto lg:mx-0" />
                  
                  <p className="text-brand-cocoa/85 text-sm sm:text-base leading-relaxed">
                    {bio}
                  </p>

                  <div className="pt-4">
                    <Link
                      href="/artist"
                      className="inline-flex items-center space-x-1.5 text-sm font-bold text-brand-cocoa hover:text-brand-rose transition-colors"
                    >
                      <span>Meet {name.split(' ')[0]}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      }

      case 'custom_cta': {
        const heading = homepageData?.custom_cta_heading || 'Have Something Special in Mind?';
        const description = homepageData?.custom_cta_description || "Tell us what you're imagining, and we'll create something especially for you. Choose custom colors, personalization details, and gifting cards.";

        return (
          <section key="custom_cta" className="py-20 bg-brand-rose text-brand-cream relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none select-none">
              <div className="w-96 h-96 border border-brand-cream rounded-full absolute -top-48 -left-48" />
              <div className="w-96 h-96 border border-brand-cream rounded-full absolute -bottom-48 -right-48" />
            </div>

            <div className="max-w-4xl mx-auto px-4 text-center space-y-6 sm:space-y-8 relative z-10">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                {heading}
              </h2>
              <p className="text-base sm:text-lg text-brand-cream/90 max-w-xl mx-auto leading-relaxed whitespace-pre-line">
                {description}
              </p>
              <div className="pt-2">
                <Link
                  href="/custom-orders"
                  className="inline-flex items-center space-x-2 bg-brand-cream text-brand-rose hover:bg-brand-cocoa hover:text-brand-cream transition-all duration-300 font-semibold text-sm py-4 px-8 rounded shadow-md hover:shadow-lg"
                >
                  <span>Request Custom Crochet</span>
                  <Sparkles size={16} />
                </Link>
              </div>
            </div>
          </section>
        );
      }

      case 'instagram':
        return (
          <section key="instagram" className="py-16 bg-brand-cream border-b border-brand-beige/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10 sm:mb-12">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa mb-1">
                  Follow Along
                </h2>
                <p className="text-sm font-serif italic text-brand-rose mb-3">
                  Little creations, behind-the-scenes moments and new drops.
                </p>
                <div className="w-16 h-[1.5px] bg-brand-rose mx-auto" />
              </div>

              {/* Instagram post cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  '/images/pink_flower.png',
                  '/images/damru_keychain.jpg',
                  '/images/red_bow_clips.jpg',
                  '/images/pink_bouquet.png',
                  '/images/letter_s_keychain.png',
                  '/images/butterfly_keychain.jpg',
                ].map((imgSrc, i) => (
                  <a
                    key={i}
                    href="https://instagram.com/neeshita.198"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square rounded-md overflow-hidden border border-brand-beige/50 bg-brand-beige/10 hover:border-brand-rose/60 transition-colors shadow-sm"
                  >
                    <Image
                      src={imgSrc}
                      alt={`Instagram Post ${i + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-brand-cocoa/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-brand-cream text-xs font-semibold tracking-widest uppercase">
                        @neeshita.198
                      </span>
                    </div>
                  </a>
                ))}
              </div>

              <div className="text-center mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/shop"
                  className="inline-flex items-center space-x-2 text-sm font-bold bg-brand-rose text-brand-cream hover:bg-brand-cocoa transition-colors py-2.5 px-6 rounded-full shadow-sm"
                >
                  <span>See More Crochet Creations</span>
                </Link>
                <a
                  href="https://instagram.com/neeshita.198"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-sm font-bold text-brand-cocoa hover:text-brand-rose border border-brand-beige bg-brand-offwhite py-2.5 px-6 rounded-full shadow-sm transition-colors"
                >
                  <span>Follow @neeshita.198</span>
                </a>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Navbar */}
      <Navbar />

      {/* Main sections loop based on dynamic display order */}
      <main className="flex-grow">
        {loading ? (
          <div className="flex items-center justify-center py-24 bg-brand-cream/30">
            <div className="w-8 h-8 border-2 border-brand-rose border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          sectionOrder.map((sectionKey: string) => renderSection(sectionKey))
        )}

        {/* 4. Trust symbols layout strip (always visible below hero if hero exists) */}
        {visibility.hero && (
          <section className="bg-brand-beige/25 border-b border-brand-beige/40 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="flex flex-col items-center space-y-1">
                <Award className="text-brand-rose mb-1" size={24} />
                <h3 className="font-serif text-sm font-bold text-brand-cocoa">Handmade</h3>
                <p className="text-[11px] text-brand-cocoa/70">Crafted with patience and care</p>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <Sparkles className="text-brand-rose mb-1" size={24} />
                <h3 className="font-serif text-sm font-bold text-brand-cocoa">Customizable</h3>
                <p className="text-[11px] text-brand-cocoa/70">Made especially for you</p>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <Gift className="text-brand-rose mb-1" size={24} />
                <h3 className="font-serif text-sm font-bold text-brand-cocoa">Thoughtful</h3>
                <p className="text-[11px] text-brand-cocoa/70">Perfect details for gifting</p>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <Calendar className="text-brand-rose mb-1" size={24} />
                <h3 className="font-serif text-sm font-bold text-brand-cocoa">Small Batch</h3>
                <p className="text-[11px] text-brand-cocoa/70">Made with attention to detail</p>
              </div>
            </div>
          </section>
        )}

        {/* 10. Newsletter Section */}
        <section className="py-16 sm:py-20 bg-brand-beige/15 border-b border-brand-beige/30">
          <div className="max-w-md mx-auto px-4 text-center space-y-6">
            <span className="text-brand-rose text-2xl">♡</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa leading-tight">
              Stay in the little loop
            </h2>
            <p className="text-xs sm:text-sm text-brand-cocoa/75 leading-relaxed max-w-sm mx-auto">
              Be the first to know about new creations, custom drops and special updates. No spam, only warm letters.
            </p>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for subscribing! Welcome to the Neeshiartique family. ♡');
              }}
              className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-2"
            >
              <input
                type="email"
                placeholder="Your email address"
                required
                className="flex-grow bg-brand-cream border border-brand-beige rounded px-4 py-3 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa placeholder-brand-cocoa/50"
              />
              <button
                type="submit"
                className="bg-brand-cocoa text-brand-cream hover:bg-brand-rose transition-colors font-semibold text-xs uppercase tracking-wider py-3.5 px-6 rounded"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* 11. Footer */}
      <Footer />

      {/* Quick View Modal Overlay */}
      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

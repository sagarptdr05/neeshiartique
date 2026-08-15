'use client';

import React, { useState } from 'react';
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

  // Filter bestseller products (up to 8 for desktop grid)
  const bestsellerProducts = products.filter((p) => p.bestseller && p.status === 'active').slice(0, 8);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Navbar */}
      <Navbar />

      {/* 3. Hero Section */}
      <section className="relative overflow-hidden bg-brand-cream py-16 lg:py-24 border-b border-brand-beige/30">
        {/* Floating background decorative details */}
        <div className="absolute top-10 left-10 text-brand-rose/25 animate-float select-none pointer-events-none text-2xl font-serif">
          ✿
        </div>
        <div className="absolute bottom-20 right-16 text-brand-rose/20 animate-float select-none pointer-events-none text-3xl font-serif" style={{ animationDelay: '2s' }}>
          ❀
        </div>
        <div className="absolute top-1/3 right-1/3 text-brand-rose/15 animate-float select-none pointer-events-none text-xl" style={{ animationDelay: '1s' }}>
          ✦
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-brand-blush/30 border border-brand-blush/60 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-brand-rose">
              <Sparkles size={12} />
              <span>Handmade with Love</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-brand-cocoa leading-[1.1]">
              Little Things,<br />
              <span className="text-brand-rose italic font-medium">Crocheted With Love.</span>
            </h1>

            <p className="text-base sm:text-lg text-brand-cocoa/85 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Handmade crochet creations, thoughtful gifts and custom pieces — made one stitch at a time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                href="/shop"
                className="w-full sm:w-auto bg-brand-rose text-brand-cream hover:bg-brand-cocoa transition-colors text-sm font-semibold tracking-wide py-3.5 px-8 rounded flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>Shop Crochet</span>
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
                  src="/images/butterfly_keychain.jpg"
                  alt="Crochet Butterfly Keychain"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute bottom-3 left-3 bg-brand-cream/90 backdrop-blur-sm py-1 px-3.5 rounded text-[11px] font-bold text-brand-cocoa border border-brand-beige shadow-sm">
                  Handcrafted Butterfly Keychain
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

      {/* 4. Trust / Brand Features Strip */}
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

      {/* 5. Featured Categories Section */}
      <section className="py-16 sm:py-20 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-cocoa mb-3">
              Explore Our Crochet
            </h2>
            <div className="w-16 h-[1.5px] bg-brand-rose mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
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
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-cocoa/80 via-brand-cocoa/20 to-transparent flex flex-col justify-end p-4 transition-colors group-hover:via-brand-cocoa/30" />
                
                <div className="absolute bottom-4 left-4 right-4 text-brand-cream z-10 transition-transform duration-300">
                  <h3 className="font-serif text-lg font-bold mb-1 group-hover:text-brand-blush flex items-center justify-between">
                    <span>{category.name}</span>
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </h3>
                  <p className="text-[10px] text-brand-cream/80 font-medium line-clamp-2">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Bestsellers / Featured Products ("Made With Love") */}
      <section className="py-16 sm:py-20 bg-brand-cream border-t border-brand-beige/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-cocoa mb-1">
              Made With Love
            </h2>
            <p className="text-sm font-serif italic text-brand-rose mb-3">
              Some of our little favourites.
            </p>
            <div className="w-16 h-[1.5px] bg-brand-rose mx-auto" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {bestsellerProducts.map((product) => (
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

      {/* 7. Meet the Artist Section ("The Hands Behind the Yarn. 🧶") */}
      <section className="py-16 sm:py-20 bg-brand-beige/10 border-t border-b border-brand-beige/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Portrait Image */}
            <div className="lg:col-span-5 relative aspect-[4/5] rounded-lg overflow-hidden border border-brand-beige shadow-md bg-brand-beige/10 group">
              <Image
                src="/images/neeshita.jpg"
                alt="Neeshita - The creator behind Neeshiartique"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute bottom-4 right-4 bg-brand-cream/90 border border-brand-beige px-4 py-2 rounded text-xs font-bold font-serif text-brand-cocoa shadow-sm">
                Neeshita • Founder & Artist
              </div>
            </div>

            {/* Meet text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="text-xs font-bold text-brand-rose tracking-widest uppercase">
                Meet the Creator
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-cocoa leading-tight">
                The Hands Behind the Yarn. 🧶
              </h2>
              <div className="w-16 h-[1.5px] bg-brand-rose mx-auto lg:mx-0" />
              
              <p className="text-brand-cocoa/85 text-sm sm:text-base leading-relaxed">
                Meet Neeshita, the creator behind Neeshiartique. What started with a childhood love for art slowly grew into a love for crochet during her second year of engineering — eventually turning into a little world of handmade creations.
              </p>

              <div className="pt-4">
                <Link
                  href="/artist"
                  className="inline-flex items-center space-x-1.5 text-sm font-bold text-brand-cocoa hover:text-brand-rose transition-colors"
                >
                  <span>Meet Neeshita</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Custom Order CTA Section */}
      <section className="py-20 bg-brand-rose text-brand-cream relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none select-none">
          {/* Subtle line motif background */}
          <div className="w-96 h-96 border border-brand-cream rounded-full absolute -top-48 -left-48" />
          <div className="w-96 h-96 border border-brand-cream rounded-full absolute -bottom-48 -right-48" />
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center space-y-6 sm:space-y-8 relative z-10">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Have Something Special in Mind?
          </h2>
          <p className="text-base sm:text-lg text-brand-cream/90 max-w-xl mx-auto leading-relaxed">
            Tell us what you're imagining, and we'll create something especially for you. Choose custom colors, personalization details, and gifting cards.
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

      {/* 9. Instagram Gallery ("Follow Along") */}
      <section className="py-16 bg-brand-cream border-b border-brand-beige/30">
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

          {/* Collage Images */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              '/images/pink_flower.png',
              '/images/damru_keychain.jpg',
              '/images/red_bow_clips.jpg',
              '/images/pink_bouquet.png',
              '/images/letter_s_keychain.png',
              '/images/butterfly_keychain.jpg'
            ].map((imgSrc, i) => (
              <a
                key={i}
                href="https://instagram.com/neeshiartique"
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
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-brand-cocoa/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-brand-cream text-xs font-semibold tracking-widest uppercase">
                    @neeshiartique
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
              href="https://instagram.com/neeshiartique"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-sm font-bold text-brand-cocoa hover:text-brand-rose border border-brand-beige bg-brand-offwhite py-2.5 px-6 rounded-full shadow-sm transition-colors"
            >
              <span>Follow @neeshiartique</span>
            </a>
          </div>
        </div>
      </section>

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

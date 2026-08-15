'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Eye, Heart, Camera, HeartHandshake, Sparkles, Layers, Box } from 'lucide-react';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface GalleryItem {
  id: number;
  src: string;
  title: string;
  description: string;
  section: 'world' | 'process' | 'details' | 'gifting' | 'recent';
}

export default function Gallery() {
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const [selectedSection, setSelectedSection] = useState<'all' | 'world' | 'process' | 'details' | 'gifting' | 'recent'>('all');
  const [likedItems, setLikedItems] = useState<number[]>([]);

  const sectionsList = [
    { id: 'all', label: 'All Creations', icon: Layers },
    { id: 'world', label: 'Our Crochet World', icon: CompassIcon },
    { id: 'process', label: 'Made By Hand', icon: HeartHandshake },
    { id: 'details', label: 'Little Details', icon: Sparkles },
    { id: 'gifting', label: 'Made For Someone Special', icon: Box },
    { id: 'recent', label: 'Recently Created', icon: Camera },
  ];

  const galleryItems: GalleryItem[] = [
    // Our Crochet World
    {
      id: 1,
      src: '/images/butterfly_keychain.jpg',
      title: 'Crochet Butterfly Keychain',
      description: 'Handcrafted with premium organic cotton threads, featuring dangling floral bells.',
      section: 'world',
    },
    {
      id: 2,
      src: '/images/evil_eye_keychain.jpg',
      title: 'Crochet Evil Eye Charm',
      description: 'Concentric protective rings stitched in deep navy, white, cerulean, and soft beige.',
      section: 'world',
    },
    {
      id: 3,
      src: '/images/flower_bookmark.jpg',
      title: 'Crochet Flower Bookmark',
      description: 'Elegant long-stemmed lavender and lilac bloom bookmarks sitting flat inside books.',
      section: 'world',
    },
    {
      id: 4,
      src: '/images/hair_accessories.jpg',
      title: 'Crochet Hair Bow Clips',
      description: 'Set of blush pink hair bows mounted on secure metal alligator clips for charm and warmth.',
      section: 'world',
    },
    // Made By Hand
    {
      id: 5,
      src: '/images/hair_accessories.jpg',
      title: 'Winding Soft Cotton Yarns',
      description: 'Winding premium pink yarns on wooden spindles to prepare for keychains stitch work.',
      section: 'process',
    },
    {
      id: 6,
      src: '/images/flower_bookmark.jpg',
      title: 'Hooks and Stitch Markers',
      description: 'Selecting standard 3.0mm silver hooks for double-knitting bookmarks leaves.',
      section: 'process',
    },
    // Little Details
    {
      id: 7,
      src: '/images/butterfly_keychain.jpg',
      title: 'Macro Look at Lock Stitches',
      description: 'Concentric chain loops locked safely at the base to prevent any thread unravelling.',
      section: 'details',
    },
    {
      id: 8,
      src: '/images/hair_accessories.jpg',
      title: 'Securing Alligator Bow Clips',
      description: 'A detailed look at hot-glue adhesion on metal clips ensuring maximum hold.',
      section: 'details',
    },
    // Made For Someone Special
    {
      id: 9,
      src: '/images/custom_gift.jpg',
      title: 'Kraft Gift Box Packaging',
      description: 'Items nested carefully inside recycled kraft boxes, tied with cotton ribbons.',
      section: 'gifting',
    },
    {
      id: 10,
      src: '/images/custom_gift.jpg',
      title: 'Handwritten Calligraphy Notes',
      description: 'Writing personalized cardboard labels and gift letters for customized crochet packages.',
      section: 'gifting',
    },
    {
      id: 11,
      src: '/images/flower_bookmark.jpg',
      title: 'Crochet Mini Sunflower Pot',
      description: 'A customer-requested desk sunflower resting inside a knitted terracotta pot.',
      section: 'recent',
    },
    {
      id: 12,
      src: '/images/custom_gift.jpg',
      title: 'Custom Bridesmaid Gift Bundle',
      description: 'Customized keychain and bookmark matching box sets recently dispatched.',
      section: 'recent',
    },
    {
      id: 13,
      src: '/images/pink_flower.png',
      title: 'Crochet Pink Blossom Hairclip',
      description: 'Close-up of a hand-crafted gradient pink flower hairclip with a delicate pearl core.',
      section: 'details',
    },
    {
      id: 14,
      src: '/images/damru_keychain.jpg',
      title: 'Festive Crochet Damru Keychain',
      description: 'Spiritual brown and white damru keychain decorated with brass bells, made for Sawan.',
      section: 'world',
    },
    {
      id: 15,
      src: '/images/red_bow_clips.jpg',
      title: 'Red Crochet Bow Clips',
      description: 'Set of two deep red crochet hair clips decorated with sweet contrast pink bows.',
      section: 'world',
    },
    {
      id: 16,
      src: '/images/pink_bouquet.png',
      title: 'Crochet Mini Rose Bouquet',
      description: 'A tiny, hand-knitted bouquet of red and pink roses wrapped in a cone and tied with a red ribbon.',
      section: 'gifting',
    },
    {
      id: 17,
      src: '/images/letter_s_keychain.png',
      title: 'Custom Alphabet "S" Keychain',
      description: 'Custom ordered letter keychain in deep blue, featuring a matching crochet crown and small pearls.',
      section: 'recent',
    },
  ];

  const filteredItems = selectedSection === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.section === selectedSection);

  const toggleLike = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (likedItems.includes(id)) {
      setLikedItems(likedItems.filter(item => item !== id));
    } else {
      setLikedItems([...likedItems, id]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Navbar */}
      <Navbar />

      {/* Header Banner */}
      <section className="bg-brand-beige/25 border-b border-brand-beige py-12 text-center relative overflow-hidden flex-shrink-0">
        <div className="absolute top-4 left-6 text-brand-rose/10 text-3xl font-serif select-none pointer-events-none">✿</div>
        <div className="absolute bottom-4 right-10 text-brand-rose/15 text-4xl font-serif select-none pointer-events-none">❀</div>
        
        <div className="max-w-3xl mx-auto px-4 space-y-3">
          <span className="text-xs font-bold tracking-widest text-brand-rose uppercase">
            Visual Storybook
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-cocoa">
            Our Crochet Gallery
          </h1>
          <p className="text-sm font-serif italic text-brand-rose">
            Browse through our curated crochet sections, process details, and gifting setups.
          </p>
          <div className="w-16 h-[1.5px] bg-brand-rose mx-auto mt-2" />
        </div>
      </section>

      {/* Gallery Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow space-y-12">
        
        {/* Curated Section Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 border-b border-brand-beige/40 pb-6 flex-shrink-0">
          {sectionsList.map((sec) => {
            const Icon = sec.icon;
            const isActive = selectedSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id as any)}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                  isActive
                    ? 'bg-brand-rose border-brand-rose text-brand-cream shadow-sm'
                    : 'bg-brand-offwhite border-brand-beige text-brand-cocoa hover:border-brand-rose hover:text-brand-rose'
                }`}
              >
                <Icon size={12} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const isLiked = likedItems.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                className="group bg-brand-offwhite border border-brand-beige/50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-square w-full bg-brand-beige/10 overflow-hidden">
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-brand-cocoa/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3 z-10">
                    <button
                      onClick={(e) => toggleLike(item.id, e)}
                      className={`p-2 rounded-full bg-brand-cream/90 hover:bg-brand-cream border border-brand-beige shadow transition-transform hover:scale-110 ${
                        isLiked ? 'text-brand-rose' : 'text-brand-cocoa'
                      }`}
                      aria-label="Like creation"
                    >
                      <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                    </button>
                    <div className="p-2 rounded-full bg-brand-cream/90 border border-brand-beige shadow transition-transform hover:scale-110 text-brand-cocoa">
                      <Eye size={16} />
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-brand-rose bg-brand-blush/20 border border-brand-blush/30 px-2 py-0.5 rounded-sm">
                    {sectionsList.find(s => s.id === item.section)?.label}
                  </span>
                  <h3 className="font-serif text-base font-bold text-brand-cocoa pt-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-brand-cocoa/75 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20 space-y-2 border border-dashed border-brand-beige rounded-lg">
            <p className="text-sm font-serif italic text-brand-rose">No creations to show in this section yet.</p>
            <p className="text-xs text-brand-cocoa/60">Check back later or explore other sections!</p>
          </div>
        )}

      </main>

      {/* Lightbox / Detail Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-brand-cocoa/55 backdrop-blur-sm" onClick={() => setActiveItem(null)} />

          {/* Container */}
          <div className="relative bg-brand-cream border border-brand-beige rounded-lg w-full max-w-lg shadow-2xl overflow-hidden z-10 p-5 sm:p-6 animate-slide-up flex flex-col">
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-brand-cocoa hover:text-brand-rose transition-colors z-20"
            >
              <X size={20} />
            </button>

            <div className="relative aspect-square w-full rounded border border-brand-beige/50 bg-brand-beige/10 overflow-hidden">
              <Image
                src={activeItem.src}
                alt={activeItem.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="pt-4 space-y-2 text-brand-cocoa">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-rose border border-brand-rose/25 bg-brand-rose/5 px-2 py-0.5 rounded-sm inline-block">
                {sectionsList.find(s => s.id === activeItem.section)?.label}
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold">
                {activeItem.title}
              </h3>
              <p className="text-xs sm:text-sm text-brand-cocoa/80 leading-relaxed">
                {activeItem.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Compass Icon fallback helper
const CompassIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

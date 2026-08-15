'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Sparkles, Scissors, Gift, Coffee, Smile, Compass, Send } from 'lucide-react';
import { BRAND_CONFIG } from '@/config/brand';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function About() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="bg-brand-cream border-b border-brand-beige py-16 text-center relative overflow-hidden">
        {/* Soft background elements */}
        <div className="absolute top-4 left-6 text-brand-rose/10 text-3xl font-serif select-none pointer-events-none">✿</div>
        <div className="absolute bottom-4 right-10 text-brand-rose/15 text-4xl font-serif select-none pointer-events-none">❀</div>
        
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          <span className="text-xs font-bold tracking-widest text-brand-rose uppercase">
            Behind the Brand
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-cocoa leading-tight">
            A Little World of Crochet, Made With Love.
          </h1>
          <p className="text-sm font-serif italic text-brand-rose max-w-lg mx-auto leading-relaxed">
            "We believe that beautiful things take time. In each stitch, we weave a bit of warmth, love, and authenticity."
          </p>
          <div className="w-16 h-[1.5px] bg-brand-rose mx-auto mt-2" />
        </div>
      </section>

      {/* Editorial Content */}
      <main className="flex-grow bg-brand-cream/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-24">
          
          {/* Section 1: Our Story */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 relative aspect-[4/5] rounded-lg border border-brand-beige overflow-hidden shadow bg-brand-beige/10 group">
              <Image
                src="/images/custom_gift.jpg"
                alt="Neeshita crafting crochet details"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute bottom-4 right-4 bg-brand-cream/90 border border-brand-beige px-4 py-2 rounded text-xs font-bold font-serif text-brand-cocoa shadow-sm">
                Neeshita • Founder & Maker
              </div>
            </div>
            <div className="lg:col-span-7 space-y-5">

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
                Our Story: How It All Began
              </h2>
              <p className="text-sm text-brand-cocoa/80 leading-relaxed">
                Neeshiartique began in a quiet studio space, surrounded by colorful skeins of yarn and a desire to create tactile art. What started as a small personal hobby—crocheting little gifts for close friends—quickly grew into a passion-filled brand. Inspired by the warmth of organic fibers and the classic art of knitting, Neeshita set out to create a boutique dedicated entirely to high-quality, handmade crochet creations that bring character to everyday objects.
              </p>
              <div className="text-xs font-bold text-brand-cocoa italic border-l border-brand-rose/40 pl-4 py-1">
                "It started with a single ball of cotton yarn, a size 3.0mm hook, and a dream to craft things that last."
              </div>
            </div>
          </div>

          <hr className="border-brand-beige/30" />

          {/* Section 2: Why Crochet? */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center lg:flex-row-reverse">
            <div className="lg:col-span-7 space-y-5 lg:order-2">

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
                Why Crochet? The Art of Tactile Warmth
              </h2>
              <p className="text-sm text-brand-cocoa/80 leading-relaxed">
                Crochet is a unique art form. Unlike machine-knit fabrics, crochet cannot be replicated by modern industrial machines. Every loop, chain, and stitch must be crafted by hand, hook in hand. This means that every single product in our store is entirely individual—no two pieces are exactly identical. The soft texture, warmth, and structural patterns of cotton threads offer an organic feeling that mass-manufactured plastic accessories simply cannot match.
              </p>
              <p className="text-sm text-brand-cocoa/80 leading-relaxed">
                We believe that in a world of quick automation, carrying a hand-stitched keychain or placing a crochet sunflower on your desk serves as a beautiful reminder of patient human craftsmanship.
              </p>
            </div>
            <div className="lg:col-span-5 relative aspect-[4/5] rounded-lg border border-brand-beige overflow-hidden shadow bg-brand-beige/10 lg:order-1 group">
              <Image
                src="/images/butterfly_keychain.jpg"
                alt="Detailed Crochet Stitches"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          <hr className="border-brand-beige/30" />

          {/* Section 3: Made One Stitch At A Time */}
          <div className="space-y-6 text-center max-w-3xl mx-auto">

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
              Made One Stitch At A Time
            </h2>
            <div className="w-12 h-[1px] bg-brand-rose mx-auto" />
            <p className="text-sm sm:text-base text-brand-cocoa/80 leading-relaxed italic">
              "We don't believe in mass production. Our creations are made in small batches or crafted-to-order, ensuring that we pay attention to detail, maintain high standards, and put a little bit of warmth and heartbeat into every package."
            </p>
            <p className="text-xs text-brand-cocoa/70 max-w-xl mx-auto">
              Each keychain, bookmark, and flower pot requires hours of careful loops, counting stitches, tucking tails, and forming details. By limiting our production, we keep the experience personal, authentic, and high quality.
            </p>
          </div>

          <hr className="border-brand-beige/30" />

          {/* Section 4: From Idea To Creation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 relative aspect-[4/5] rounded-lg border border-brand-beige overflow-hidden shadow bg-brand-beige/10 group">
              <Image
                src="/images/hair_accessories.jpg"
                alt="Yarn materials and needles"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="lg:col-span-7 space-y-5">

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
                Our Process: From Yarn to Creation
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3.5">
                  <div className="bg-brand-rose/10 text-brand-rose p-1.5 rounded-full mt-0.5">
                    <Compass size={14} />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-brand-cocoa">1. Design & Color Palette</h4>
                    <p className="text-xs text-brand-cocoa/75 mt-0.5">We select color combinations that evoke feelings of warmth, vintage aesthetics, and modern creative charm.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3.5">
                  <div className="bg-brand-rose/10 text-brand-rose p-1.5 rounded-full mt-0.5">
                    <Scissors size={14} />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-brand-cocoa">2. Material Selection</h4>
                    <p className="text-xs text-brand-cocoa/75 mt-0.5">We use organic, hypoallergenic cotton yarns and metal closures to ensure durability and touchable comfort.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3.5">
                  <div className="bg-brand-rose/10 text-brand-rose p-1.5 rounded-full mt-0.5">
                    <Coffee size={14} />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-brand-cocoa">3. Stitched and Checked</h4>
                    <p className="text-xs text-brand-cocoa/75 mt-0.5">Each loop is tightened carefully, and every finished item goes through a details audit before joining the catalog.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-brand-beige/30" />

          {/* Section 5: Made For Gifting */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center lg:flex-row-reverse">
            <div className="lg:col-span-7 space-y-5 lg:order-2">

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
                Made For Gifting: Spreading Joy
              </h2>
              <p className="text-sm text-brand-cocoa/80 leading-relaxed">
                Handmade crochet makes the ultimate thoughtful gift. When you give a handmade item, you are giving a gift of time, care, and attention. To make gifting extra special, Neeshiartique offers custom-crafted gift boxes. We bundle our bookmarks, keychains, and bows inside premium kraft boxes, wrapped in soft cotton ribbons, and finished with a delicate sprig of dried baby's breath flowers.
              </p>
              <div className="flex items-center space-x-3 text-brand-rose text-xs font-bold pt-2">
                <span className="flex items-center space-x-1">
                  <Gift size={14} />
                  <span>Premium Kraft Boxes</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Sparkles size={14} />
                  <span>Handwritten Gift Notes</span>
                </span>
              </div>
            </div>
            <div className="lg:col-span-5 relative aspect-[4/5] rounded-lg border border-brand-beige overflow-hidden shadow bg-brand-beige/10 lg:order-1 group">
              <Image
                src="/images/custom_gift.jpg"
                alt="Kraft Gift Packaging"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          <hr className="border-brand-beige/30" />

          {/* Section 6: Custom Crochet */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 relative aspect-[4/5] rounded-lg border border-brand-beige overflow-hidden shadow bg-brand-beige/10 group">
              <Image
                src="/images/evil_eye_keychain.jpg"
                alt="Custom Keychain request"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="lg:col-span-7 space-y-5">

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
                Custom Crochet: Your Ideas, Knitted
              </h2>
              <p className="text-sm text-brand-cocoa/80 leading-relaxed">
                Have a unique colorway or pattern in mind? We love collaborating with our customers to bring custom designs to life. Whether you want to match a bridesmaid theme, create custom-colored flower bookmarks for a book club, or stitch personalized keychains for a birthday party, we are ready to weave your ideas. You can request changes in size, yarn colors, and card tags directly through our custom orders page.
              </p>
              <div className="pt-2">
                <Link
                  href="/custom-orders"
                  className="inline-flex items-center space-x-2 bg-brand-rose hover:bg-brand-cocoa text-brand-cream text-xs font-bold tracking-wider py-3 px-6 rounded shadow transition-all uppercase"
                >
                  <span>Request Custom Crochet</span>
                  <Send size={12} />
                </Link>
              </div>
            </div>
          </div>

          <hr className="border-brand-beige/30" />

          {/* Section 7: Our Promise */}
          <div className="bg-brand-beige/10 border border-brand-beige/40 rounded-lg p-8 sm:p-10 space-y-6 text-center max-w-3xl mx-auto">

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
              Our Promise to You
            </h2>
            <p className="text-sm text-brand-cocoa/80 leading-relaxed max-w-xl mx-auto">
              We promise to use only soft, durable, skin-friendly cotton threads. We promise to pack each item securely to protect the delicate stitches. And most importantly, we promise to deliver a premium handcrafted product that feels special, personal, and artistic.
            </p>
            <div className="flex items-center justify-center space-x-6 text-[10px] font-bold text-brand-cocoa uppercase tracking-wider">
              <span className="flex items-center space-x-1">
                <Smile size={14} className="text-brand-rose" />
                <span>100% Handmade</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Heart size={14} className="text-brand-rose" />
                <span>Soft Organic Cotton</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Gift size={14} className="text-brand-rose" />
                <span>Plastic-Free Wrap</span>
              </span>
            </div>
          </div>

        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

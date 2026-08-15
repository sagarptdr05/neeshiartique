'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Sparkles, Play, Gift, Clock, Smile, ChevronRight, Mail, MapPin } from 'lucide-react';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ArtistProfile() {
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArtist = async () => {
      try {
        const res = await fetch('/api/artist');
        const data = await res.json();
        if (res.ok && data.success && data.artist) {
          setArtist(data.artist);
        }
      } catch (err) {
        console.error('Failed to load artist profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadArtist();
  }, []);

  const name = artist?.name || 'Neeshita Prajapati';
  const profilePhoto = artist?.profile_photo || '/images/neeshita.jpg';
  const shortIntro = artist?.short_intro || 'Hi, I’m Neeshita, the hands behind the yarn. 🧶✨ Turning little loops into beautiful, handmade creations—one stitch, one idea, and one piece of love at a time. 💕';
  const email = artist?.email || 'neeshita.art27@gmail.com';
  const location = artist?.location || 'Mumbai, India';
  
  const storyChildhood = artist?.story_childhood || 'Art has been a part of me since childhood. I’ve always loved creating things and expressing ideas through creativity. Over time, that love for making things slowly found its way into crochet.';
  const storyEngineering = artist?.story_engineering || 'It was during my second year of engineering that I slowly started getting interested in crochet. Amidst formulas and computer screens, I wanted to find a tactile, calming outlet to channel my childhood interest in art.';
  const storyYoutube = artist?.story_youtube || 'I began learning crochet patterns through YouTube videos, trying different stitches, learning little by little, and slowly discovering how much I enjoyed turning a simple strand of yarn into something real. 🧶';
  const storyFriendGift = artist?.story_friend_gift || 'One of the things that inspired me was simply wanting to make a special gift for my best friend. Making something with my own hands felt different. It wasn’t just a gift — it carried time, effort and a little piece of me. That feeling made me realize how special handmade gifts can be, and I wanted to create pieces that could make someone else feel the same way.';
  const storyChatgpt = artist?.story_chatgpt || 'And how did Neeshiartique actually begin? Honestly... bas aise hi decide ho gaya ChatGPT se. 😂 Sometimes the best ideas don’t arrive with a big plan. They just start with a little curiosity, a little courage and the decision to give something a try.';
  const storyFavourites = artist?.story_favourites || 'I especially love crocheting keychains and bouquets because they can make people feel special. They’re little creations, but sometimes the smallest gifts can carry the biggest feelings.';
  const storyTime = artist?.story_time || 'Crochet takes time. Every stitch is made by hand, and every piece needs patience. But even when a creation takes longer than expected, I still want to make it with love for the person who will receive it. The time that goes into a handmade piece is part of what makes it special.';
  const storyProcess = artist?.story_process || 'Inspiration ➔ Choosing the Idea ➔ Learning & Exploring ➔ Crocheting ➔ Finishing Touches ➔ Made With Love';
  const storyFuture = artist?.story_future || 'There are still so many things I want to learn and create. One day, I’d love to make crochet tops, handbags, bigger and bigger bouquets, and explore even more ambitious crochet ideas. For now, I’m enjoying the journey — one stitch at a time. 🧶✨';
  const storySignature = artist?.story_signature || 'Every piece I make takes a little time, a lot of patience and a whole lot of love. And knowing that something I created might become a special gift for someone makes every stitch worth it. 💕 Thank you for being here and for supporting my little crochet journey. — Neeshita';

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream/30">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="bg-brand-cream border-b border-brand-beige py-16 sm:py-20 relative overflow-hidden">
        {/* Soft floating background design details */}
        <div className="absolute top-4 left-6 text-brand-rose/10 text-3xl font-serif select-none pointer-events-none">✿</div>
        <div className="absolute bottom-4 right-10 text-brand-rose/15 text-4xl font-serif select-none pointer-events-none">❀</div>
        <div className="absolute top-1/4 right-1/4 text-brand-rose/10 animate-float text-xl pointer-events-none">✨</div>

        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <span className="text-xs font-bold tracking-widest text-brand-rose uppercase">
            Meet the Artist
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-brand-cocoa leading-tight">
            {name}
          </h1>
          
          {/* Metadata banner */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-4 text-xs font-semibold text-brand-cocoa/70 tracking-wide bg-brand-beige/20 py-2 px-6 rounded-full w-fit mx-auto border border-brand-beige/50">
            <span className="flex items-center space-x-1">
              <MapPin size={12} className="text-brand-rose" />
              <span>{location}</span>
            </span>
            <span className="hidden sm:inline text-brand-cocoa/30">|</span>
            <span className="flex items-center space-x-1">
              <Mail size={12} className="text-brand-rose" />
              <a href={`mailto:${email}`} className="hover:underline">{email}</a>
            </span>
            <span className="hidden sm:inline text-brand-cocoa/30">|</span>
            <span className="font-serif italic text-brand-rose">
              Neeshiartique
            </span>
          </div>

          <div className="w-16 h-[1.5px] bg-brand-rose mx-auto pt-2" />
        </div>
      </section>

      {/* Main Profile Story */}
      <main className="flex-grow">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-brand-rose border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* 1. Introductory Quote & Portrait Photo */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left Side: portrait selfie */}
                <div className="lg:col-span-5 relative aspect-[4/5] rounded-lg border border-brand-beige overflow-hidden shadow-md bg-brand-beige/10 group max-w-sm mx-auto w-full">
                  <Image
                    src={profilePhoto}
                    alt={name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-brand-cream/95 border border-brand-beige px-4 py-2.5 rounded text-center text-xs font-bold font-serif text-brand-cocoa shadow-sm">
                    {name} • The Hands Behind the Yarn 🧶
                  </div>
                </div>

                {/* Right Side: Introduction */}
                <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                  <div className="space-y-4">
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
                      Hi, I’m Neeshita, the hands behind the yarn. 🧶✨
                    </h2>
                    <p className="font-serif italic text-base text-brand-rose leading-relaxed">
                      "{shortIntro}"
                    </p>
                  </div>
                  <div className="w-12 h-[1px] bg-brand-rose/55 mx-auto lg:mx-0" />
                  <p className="text-sm text-brand-cocoa/85 leading-relaxed">
                    Welcome to my creative space. Neeshiartique is where my love for design, hands-on crafting, and thoughtful gifting all come together. Every piece in this boutique is crafted personally by me, loop by loop, from my workspace in {location.split(',')[0] || 'Mumbai'}.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Editorial Story Sections */}
            <section className="bg-brand-beige/10 border-t border-b border-brand-beige/30 py-16 sm:py-24">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-16">
                
                {/* It Started With Art */}
                <div className="space-y-4">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-cocoa flex items-center space-x-2">
                    <span className="text-brand-rose text-lg">✿</span>
                    <span>It Started With Art</span>
                  </h3>
                  <p className="text-sm text-brand-cocoa/80 leading-relaxed pl-6">
                    {storyChildhood}
                  </p>
                </div>

                {/* From Engineering to Crochet */}
                <div className="space-y-4">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-cocoa flex items-center space-x-2">
                    <span className="text-brand-rose text-lg">✿</span>
                    <span>From Engineering to Crochet</span>
                  </h3>
                  <div className="space-y-3 pl-6 text-sm text-brand-cocoa/80 leading-relaxed">
                    <p>
                      {storyEngineering}
                    </p>
                    <div className="bg-brand-cream border border-brand-beige/60 rounded p-4 flex items-start space-x-3.5 mt-2">
                      <Play className="text-brand-rose flex-shrink-0 mt-0.5" size={16} />
                      <p className="text-xs text-brand-cocoa/75">
                        {storyYoutube}
                      </p>
                    </div>
                  </div>
                </div>

                {/* It Started With a Gift */}
                <div className="space-y-4">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-cocoa flex items-center space-x-2">
                    <span className="text-brand-rose text-lg">✿</span>
                    <span>It Started With a Gift</span>
                  </h3>
                  <p className="text-sm text-brand-cocoa/80 siding-relaxed pl-6">
                    {storyFriendGift}
                  </p>
                </div>

                {/* How Neeshiartique Began */}
                <div className="space-y-4">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-cocoa flex items-center space-x-2">
                    <span className="text-brand-rose text-lg">✿</span>
                    <span>How Neeshiartique Began</span>
                  </h3>
                  <div className="space-y-3 pl-6 text-sm text-brand-cocoa/80 leading-relaxed">
                    <p className="italic font-medium text-brand-rose">
                      {storyChatgpt}
                    </p>
                    <p>
                      Sometimes the best ideas don’t arrive with a big plan. They just start with a little curiosity, a little courage and the decision to give something a try.
                    </p>
                    <p>
                      At some point, I had a simple thought — if I could make something for someone special to me, why not make it for other people too? Something they could give to someone special in their own lives. And that’s how the idea of sharing my crochet creations with others slowly began. 💕
                    </p>
                  </div>
                </div>

              </div>
            </section>

            {/* 3. My Favourite Things & Why They Matter */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-16">
              
              <div className="space-y-6">
                <h3 className="font-serif text-2xl font-bold text-brand-cocoa text-center">
                  My Favourite Things to Crochet
                </h3>
                <div className="w-12 h-[1px] bg-brand-rose/40 mx-auto" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  <div className="bg-brand-offwhite border border-brand-beige p-5 rounded-lg shadow-sm space-y-3">
                    <h4 className="font-serif text-base font-bold text-brand-cocoa flex items-center space-x-2">
                      <span className="text-xs p-1 bg-brand-blush/20 text-brand-rose rounded-full">✨</span>
                      <span>Crochet Keychains</span>
                    </h4>
                    <p className="text-xs text-brand-cocoa/80 leading-relaxed">
                      Small, cute and personal — perfect for carrying a little handmade memory wherever you go. I love how these compact creations can travel everywhere with you.
                    </p>
                  </div>

                  <div className="bg-brand-offwhite border border-brand-beige p-5 rounded-lg shadow-sm space-y-3">
                    <h4 className="font-serif text-base font-bold text-brand-cocoa flex items-center space-x-2">
                      <span className="text-xs p-1 bg-brand-blush/20 text-brand-rose rounded-full">✨</span>
                      <span>Crochet Bouquets</span>
                    </h4>
                    <p className="text-xs text-brand-cocoa/80 leading-relaxed">
                      A handmade bouquet that lasts longer than flowers and carries the thought behind the gift. Each petal and leaf is shaped painstakingly to hold its bloom forever.
                    </p>
                  </div>
                </div>
              </div>

              {/* Why These Creations Matter */}
              <div className="bg-brand-rose text-brand-cream rounded-lg p-6 sm:p-8 text-center space-y-3.5 shadow-md max-w-2xl mx-auto">
                <h4 className="font-serif text-lg sm:text-xl font-bold">
                  Made to Make Someone Feel Special
                </h4>
                <p className="text-xs sm:text-sm text-brand-cream/90 leading-relaxed">
                  {storyFavourites}
                </p>
              </div>

            </section>

            {/* 4. It Takes Time & Timeline */}
            <section className="bg-brand-beige/10 border-t border-b border-brand-beige/30 py-16 sm:py-24 space-y-16">
              
              {/* Honest Note About Time */}
              <div className="max-w-3xl mx-auto px-4 space-y-4 text-center">
                <Clock className="text-brand-rose mx-auto" size={24} />
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-cocoa">
                  It Takes Time — And That's Okay.
                </h3>
                <p className="text-sm text-brand-cocoa/85 leading-relaxed max-w-xl mx-auto">
                  {storyTime}
                </p>
              </div>

              {/* Visual Elegant Timeline */}
              <div className="max-w-4xl mx-auto px-4">
                <h4 className="font-serif text-sm font-bold text-brand-cocoa uppercase tracking-wider text-center mb-10">
                  The Journey So Far
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-center text-xs relative">
                  {/* Timeline segment 1 */}
                  <div className="space-y-2 bg-brand-cream border border-brand-beige p-4 rounded-md shadow-sm relative">
                    <span className="text-[10px] font-bold text-brand-rose uppercase tracking-wider">Childhood</span>
                    <p className="font-serif font-bold text-brand-cocoa">A Love for Art Begins</p>
                    <p className="text-[10px] text-brand-cocoa/60">Expressing ideas through coloring, sketchbooks, and design.</p>
                  </div>

                  {/* Timeline segment 2 */}
                  <div className="space-y-2 bg-brand-cream border border-brand-beige p-4 rounded-md shadow-sm relative">
                    <span className="text-[10px] font-bold text-brand-rose uppercase tracking-wider">Engineering (Yr 2)</span>
                    <p className="font-serif font-bold text-brand-cocoa">A New Interest</p>
                    <p className="text-[10px] text-brand-cocoa/60">Discovering yarn loops amidst computer screens and codes.</p>
                  </div>

                  {/* Timeline segment 3 */}
                  <div className="space-y-2 bg-brand-cream border border-brand-beige p-4 rounded-md shadow-sm relative">
                    <span className="text-[10px] font-bold text-brand-rose uppercase tracking-wider">YouTube Learning</span>
                    <p className="font-serif font-bold text-brand-cocoa">Stitch by Stitch</p>
                    <p className="text-[10px] text-brand-cocoa/60">Self-teaching stitches, learning patterns, exploring combinations.</p>
                  </div>

                  {/* Timeline segment 4 */}
                  <div className="space-y-2 bg-brand-cream border border-brand-beige p-4 rounded-md shadow-sm relative">
                    <span className="text-[10px] font-bold text-brand-rose uppercase tracking-wider">First Gifts</span>
                    <p className="font-serif font-bold text-brand-cocoa">Made for Best Friend</p>
                    <p className="text-[10px] text-brand-cocoa/60">Realizing how much effort and feeling goes into handmade gifting.</p>
                  </div>

                  {/* Timeline segment 5 */}
                  <div className="space-y-2 bg-brand-cream border border-brand-beige p-4 rounded-md shadow-sm relative">
                    <span className="text-[10px] font-bold text-brand-rose uppercase tracking-wider">Neeshiartique</span>
                    <p className="font-serif font-bold text-brand-cocoa">Sharing the Love</p>
                    <p className="text-[10px] text-brand-cocoa/60">Launching a little online boutique of warm crochet items.</p>
                  </div>
                </div>
              </div>

            </section>

            {/* 5. Creative Process Section */}
            <section className="max-w-4xl mx-auto px-4 py-16 sm:py-24 space-y-12">
              <div className="text-center space-y-2">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-cocoa">
                  The Creative Process
                </h3>
                <p className="text-xs sm:text-sm text-brand-rose font-serif italic">
                  From loose skeins to your doorstep
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
                {storyProcess.split('➔').map((step: string, i: number) => (
                  <div key={i} className="bg-brand-offwhite border border-brand-beige/50 p-4 rounded space-y-1 shadow-sm">
                    <span className="text-lg font-serif font-bold text-brand-rose block">0{i + 1}</span>
                    <h4 className="text-xs font-bold text-brand-cocoa uppercase tracking-wide truncate">{step.trim()}</h4>
                    <p className="text-[10px] text-brand-cocoa/70 font-medium">Stage {i + 1} of creation.</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. What's Next? (Future Dreams) */}
            <section className="bg-brand-beige/15 border-t border-b border-brand-beige/35 py-16 sm:py-24">
              <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
                <span className="text-xs font-bold text-brand-rose tracking-widest uppercase block">
                  Looking Forward
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-cocoa">
                  What's Next? ✨
                </h3>
                <p className="text-sm text-brand-cocoa/80 leading-relaxed max-w-xl mx-auto">
                  {storyFuture}
                </p>
                <p className="text-xs sm:text-sm font-serif italic text-brand-rose">
                  For now, I'm enjoying the journey — one stitch at a time. 🧶✨
                </p>
              </div>
            </section>

            {/* 7. Personal Closing Message & CTA */}
            <section className="max-w-3xl mx-auto px-4 py-20 text-center space-y-8">
              <div className="space-y-4">
                <span className="text-brand-rose text-3xl block">❀</span>
                <p className="font-serif text-lg sm:text-xl text-brand-cocoa italic max-w-xl mx-auto leading-relaxed">
                  "{storySignature.split('—')[0]?.trim() || storySignature}"
                </p>
                <div className="space-y-0.5 pt-4">
                  <p className="text-sm font-bold text-brand-cocoa">Thank you for being here and for supporting my little crochet journey.</p>
                  <p className="font-serif italic text-brand-rose font-semibold text-base">— {storySignature.split('—')[1]?.trim() || 'Neeshita'}</p>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/shop"
                  className="inline-flex items-center space-x-2 bg-brand-rose text-brand-cream hover:bg-brand-cocoa transition-colors text-sm font-semibold tracking-wide py-4 px-8 rounded shadow-md hover:shadow-lg"
                >
                  <span>Explore Crochet Creations</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

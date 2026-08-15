'use client';

import React from 'react';
import Link from 'next/link';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Navbar */}
      <Navbar />

      {/* 404 Main Area */}
      <main className="max-w-md mx-auto px-4 py-24 text-center space-y-6 flex-grow flex flex-col justify-center items-center">
        <span className="text-6xl text-brand-rose/40 animate-pulse">✿</span>
        
        <div className="space-y-2">
          <h1 className="font-serif text-5xl font-bold text-brand-cocoa">
            404
          </h1>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-cocoa">
            Oops! This flower fell off the branch.
          </h2>
          <p className="text-xs text-brand-rose font-semibold uppercase tracking-wider">
            Stitch not found
          </p>
        </div>

        <p className="text-sm text-brand-cocoa/75 max-w-xs leading-relaxed">
          We couldn't find the page you were looking for. It might have been relocated, or it's still being knitted!
        </p>

        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3 w-full max-w-xs">
          <Link
            href="/"
            className="bg-brand-rose text-brand-cream hover:bg-brand-cocoa transition-colors font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded shadow text-center flex-grow"
          >
            Go Back Home
          </Link>
          <Link
            href="/shop"
            className="bg-brand-offwhite border border-brand-beige text-brand-cocoa hover:bg-brand-beige transition-colors font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded text-center flex-grow"
          >
            Explore Shop
          </Link>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

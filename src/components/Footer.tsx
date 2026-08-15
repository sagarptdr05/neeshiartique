'use client';

import React from 'react';
import Link from 'next/link';
import { BRAND_CONFIG } from '@/config/brand';
import { Mail, MessageSquare } from 'lucide-react';

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="w-full bg-brand-beige/30 border-t border-brand-beige py-12 md:py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Col */}
        <div className="space-y-4">
          <Link href="/" className="inline-block">
            <span className="font-serif text-2xl font-bold text-brand-cocoa tracking-wide">
              neeshiartique
            </span>
          </Link>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-rose">
            {BRAND_CONFIG.tagline}
          </p>
          <p className="text-sm text-brand-cocoa/75 leading-relaxed max-w-xs">
            {BRAND_CONFIG.description}
          </p>
          <div className="flex items-center space-x-3 text-brand-cocoa/80 pt-2">
            <a
              href="https://instagram.com/neeshiartique"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-rose transition-colors"
              aria-label="Instagram Profile"
            >
              <InstagramIcon className="w-[18px] h-[18px]" />
            </a>
            <a
              href={BRAND_CONFIG.whatsappUrl}
              className="hover:text-brand-rose transition-colors"
              aria-label="WhatsApp Contact"
            >
              <MessageSquare size={18} />
            </a>
            <Link
              href={`mailto:${BRAND_CONFIG.email}`}
              className="hover:text-brand-rose transition-colors"
              aria-label="Email Contact"
            >
              <Mail size={18} />
            </Link>
          </div>
        </div>

        {/* Shop Col */}
        <div>
          <h4 className="font-serif text-base font-bold text-brand-cocoa tracking-wider mb-4">
            Shop
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/shop" className="text-brand-cocoa/85 hover:text-brand-rose transition-colors">
                All Crochet
              </Link>
            </li>
            <li>
              <Link href="/shop?category=keychains" className="text-brand-cocoa/85 hover:text-brand-rose transition-colors">
                Crochet Keychains
              </Link>
            </li>
            <li>
              <Link href="/shop?category=flowers" className="text-brand-cocoa/85 hover:text-brand-rose transition-colors">
                Crochet Flowers
              </Link>
            </li>
            <li>
              <Link href="/shop?category=bookmarks" className="text-brand-cocoa/85 hover:text-brand-rose transition-colors">
                Crochet Bookmarks
              </Link>
            </li>
            <li>
              <Link href="/shop?category=accessories" className="text-brand-cocoa/85 hover:text-brand-rose transition-colors">
                Crochet Accessories
              </Link>
            </li>
            <li>
              <Link href="/shop?category=gifts" className="text-brand-cocoa/85 hover:text-brand-rose transition-colors">
                Crochet Gifts
              </Link>
            </li>
            <li>
              <Link href="/custom-orders" className="text-brand-cocoa/85 hover:text-brand-rose transition-colors">
                Custom Crochet
              </Link>
            </li>
          </ul>
        </div>

        {/* Help Col */}
        <div>
          <h4 className="font-serif text-base font-bold text-brand-cocoa tracking-wider mb-4">
            Help
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/contact" className="text-brand-cocoa/85 hover:text-brand-rose transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-brand-cocoa/85 hover:text-brand-rose transition-colors">
                Shipping Information
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-brand-cocoa/85 hover:text-brand-rose transition-colors">
                Returns & Exchanges
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-brand-cocoa/85 hover:text-brand-rose transition-colors">
                FAQs
              </Link>
            </li>
            <li>
              <Link href="/account" className="text-brand-cocoa/85 hover:text-brand-rose transition-colors">
                Track Order
              </Link>
            </li>
          </ul>
        </div>

        {/* Brand Values Col */}
        <div className="space-y-4">
          <h4 className="font-serif text-base font-bold text-brand-cocoa tracking-wider mb-2">
            Our Belief
          </h4>
          <div className="bg-brand-cream/60 border border-brand-beige rounded p-4 text-xs italic leading-relaxed text-brand-cocoa/80">
            "We believe that beautiful things take time. In each stitch, we weave a bit of warmth, love, and authenticity."
          </div>
          <p className="text-[11px] font-semibold uppercase text-brand-rose tracking-widest text-center md:text-left">
            Handcrafted with love • Made in India
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-brand-beige/50 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-cocoa/60 font-medium gap-3">
        <div className="flex flex-col space-y-1 text-center sm:text-left">
          <span>© 2026 Neeshiartique. All rights reserved.</span>
          <span>
            Crafted with ♡ by Sagar Patidar ·{' '}
            <a
              href="https://www.instagram.com/sagarpatidar05/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-rose hover:underline font-semibold"
            >
              @sagarpatidar05
            </a>
          </span>
        </div>
        <div className="flex space-x-6 mt-3 sm:mt-0">
          <Link href="/contact" className="hover:text-brand-rose transition-colors">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-brand-rose transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AnnouncementBar() {
  const [text, setText] = useState('Handmade with love • Custom orders welcome ♡');
  const [enabled, setEnabled] = useState(true);
  const [link, setLink] = useState('');

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await fetch('/api/homepage');
        const data = await res.json();
        if (res.ok && data.success && data.homepage) {
          setText(data.homepage.announcement_text);
          setEnabled(data.homepage.announcement_enabled);
          setLink(data.homepage.announcement_link || '');
        }
      } catch (err) {
        // Fallback gracefully on fetch issues
      }
    };
    fetchAnnouncement();
  }, []);

  if (!enabled) return null;

  return (
    <div className="w-full bg-brand-rose text-brand-cream text-xs py-2 px-4 text-center font-medium tracking-wide transition-all">
      {link ? (
        <Link href={link} className="hover:underline">
          {text}
        </Link>
      ) : (
        <span>{text}</span>
      )}
    </div>
  );
}

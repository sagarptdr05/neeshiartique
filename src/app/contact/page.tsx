'use client';

import React, { useState } from 'react';
import { Mail, MessageSquare, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { BRAND_CONFIG } from '@/config/brand';

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
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Contact() {
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  // Submit status states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setLoading(true);
    setError(null);

    setTimeout(() => {
      setLoading(false);
      
      // Since no email backend or server action is configured, trigger error to avoid falsely claiming message delivery.
      setError(`Message delivery is unavailable because no email or backend service is configured. Please reach out directly via Email (${BRAND_CONFIG.email}) or WhatsApp at ${BRAND_CONFIG.phoneFormatted}.`);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Navbar */}
      <Navbar />

      {/* Header Banner */}
      <section className="bg-brand-beige/25 border-b border-brand-beige py-12 text-center relative overflow-hidden">
        <div className="absolute top-4 left-6 text-brand-rose/10 text-3xl font-serif select-none pointer-events-none">✿</div>
        <div className="absolute bottom-4 right-10 text-brand-rose/15 text-4xl font-serif select-none pointer-events-none">❀</div>
        
        <div className="max-w-3xl mx-auto px-4 space-y-3">
          <span className="text-xs font-bold tracking-widest text-brand-rose uppercase">
            Get in touch
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-cocoa">
            Contact Neeshiartique
          </h1>
          <p className="text-sm font-serif italic text-brand-rose">
            Drop us a line about our products, custom gifting, or business drops.
          </p>
          <div className="w-16 h-[1.5px] bg-brand-rose mx-auto mt-2" />
        </div>
      </section>

      {/* Main Grid Contact */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Side: Contact Cards */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="font-serif text-2xl font-bold text-brand-cocoa">
            Let's Keep in Touch
          </h2>
          <p className="text-sm text-brand-cocoa/80 leading-relaxed">
            Have a question about a crochet keychain, a canvas art piece, or shipping? Feel free to contact us through any of the options below. We love chat letters!
          </p>

          <div className="space-y-4 pt-4">
            {/* Instagram Card */}
            <a
              href="https://instagram.com/neeshiartique"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-4 bg-brand-offwhite border border-brand-beige rounded-lg p-4 shadow-sm hover:border-brand-rose/65 transition-colors"
            >
              <div className="p-3 bg-brand-rose/15 text-brand-rose rounded-full">
                <InstagramIcon className="w-[20px] h-[20px]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-cocoa">Follow Along Instagram</h3>
                <p className="text-xs text-brand-rose font-semibold">@neeshiartique</p>
                <p className="text-[10px] text-brand-cocoa/50 mt-0.5">Behind-the-scenes moments and drops</p>
              </div>
            </a>

            {/* WhatsApp Card */}
            <a
              href={BRAND_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-4 bg-brand-offwhite border border-brand-beige rounded-lg p-4 shadow-sm hover:border-brand-rose/65 transition-colors"
            >
              <div className="p-3 bg-brand-rose/15 text-brand-rose rounded-full">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-cocoa">WhatsApp Ordering</h3>
                <p className="text-xs text-brand-rose font-semibold">{BRAND_CONFIG.phoneFormatted}</p>
                <p className="text-[10px] text-brand-cocoa/50 mt-0.5">Chat order consultations</p>
              </div>
            </a>

            {/* Email Card */}
            <div className="flex items-center space-x-4 bg-brand-offwhite border border-brand-beige rounded-lg p-4 shadow-sm">
              <div className="p-3 bg-brand-rose/15 text-brand-rose rounded-full">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-cocoa">Email Support</h3>
                <p className="text-xs text-brand-rose font-semibold">{BRAND_CONFIG.email}</p>
                <p className="text-[10px] text-brand-cocoa/50 mt-0.5">Corporate gifting queries</p>
              </div>
            </div>

            {/* Hours Card */}
            <div className="flex items-center space-x-4 bg-brand-offwhite border border-brand-beige rounded-lg p-4 shadow-sm">
              <div className="p-3 bg-brand-rose/15 text-brand-rose rounded-full">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-brand-cocoa">Business Hours</h3>
                <p className="text-xs text-brand-cocoa/80 font-medium">Monday - Saturday</p>
                <p className="text-[10px] text-brand-cocoa/50 mt-0.5">10:00 AM - 7:00 PM IST</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div className="lg:col-span-7">
          {success ? (
            <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-8 text-center space-y-4 shadow-sm py-16 animate-fade-in">
              <div className="inline-flex p-3 rounded-full bg-brand-sage/10 text-brand-sage">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="font-serif text-xl font-bold text-brand-cocoa">
                Message Received
              </h3>
              <p className="text-xs sm:text-sm text-brand-cocoa/80 max-w-sm mx-auto leading-relaxed">
                Thank you for reaching out. We'll get back to you soon. ♡
              </p>
              <button
                onClick={() => {
                  setSuccess(false);
                  setError(null);
                }}
                className="bg-brand-rose text-brand-cream hover:bg-brand-cocoa transition-colors font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded mt-4"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 sm:p-8 shadow-sm">
              <h3 className="font-serif text-xl font-bold text-brand-cocoa border-b border-brand-beige/50 pb-3 mb-6">
                Send Us a Message
              </h3>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-4 rounded mb-6 text-center leading-relaxed">
                  <p className="font-bold mb-1">Message Delivery Offline</p>
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Yash Patil"
                      className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. yash@example.com"
                      className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 99887 76655"
                      className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">Subject *</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Inquiry about Custom Crochet Gift"
                      className="w-full bg-brand-cream border border-brand-beige rounded px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message here... Let us know what we can help you with."
                    className="w-full bg-brand-cream border border-brand-beige rounded p-3.5 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa placeholder-brand-cocoa/40"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-rose hover:bg-brand-cocoa text-brand-cream transition-colors font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded shadow-sm"
                  >
                    {loading ? 'Sending Message...' : 'Send Message'}
                  </button>
                </div>

              </form>
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

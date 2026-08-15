'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Calendar, Heart, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { BRAND_CONFIG } from '@/config/brand';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CustomOrders() {
  const router = useRouter();
  const { submitCustomOrder } = useStore();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [productType, setProductType] = useState('Crochet Keychain');
  const [occasion, setOccasion] = useState('Personal Use');
  const [preferredColor, setPreferredColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [budgetRange, setBudgetRange] = useState('Under ₹500');
  const [customizationDetails, setCustomizationDetails] = useState('');
  const [requiredDate, setRequiredDate] = useState('');
  const [refImage, setRefImage] = useState('');
  const [message, setMessage] = useState('');

  // Submit states
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !customizationDetails.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await submitCustomOrder({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        productType,
        occasion,
        preferredColor: preferredColor.trim() || 'No preference',
        quantity: Number(quantity),
        budgetRange,
        customizationDetails: customizationDetails.trim(),
        requiredDate: requiredDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], // default 1 week out
        referenceImage: refImage || undefined,
        message: message.trim() || undefined,
      });

      setLoading(false);
      if (res.success) {
        setFormSubmitted(true);
        // Reset form fields
        setName('');
        setEmail('');
        setPhone('');
        setPreferredColor('');
        setQuantity(1);
        setCustomizationDetails('');
        setRequiredDate('');
        setRefImage('');
        setMessage('');
      } else {
        setError(res.message || 'Something went wrong. Please check your inputs and try again.');
      }
    } catch (err) {
      setLoading(false);
      setError('A connection error occurred. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Navbar */}
      <Navbar />

      {/* Hero Banner Header */}
      <section className="bg-brand-beige/25 border-b border-brand-beige py-12 text-center relative overflow-hidden">
        <div className="absolute top-4 left-6 text-brand-rose/10 text-3xl font-serif select-none pointer-events-none">✿</div>
        <div className="absolute bottom-4 right-10 text-brand-rose/15 text-4xl font-serif select-none pointer-events-none">❀</div>
        
        <div className="max-w-3xl mx-auto px-4 space-y-3">
          <span className="text-xs font-bold tracking-widest text-brand-rose uppercase">
            Bespoke Creations
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-cocoa">
            Have a Crochet Idea?
          </h1>
          <p className="text-sm font-serif italic text-brand-rose">
            Tell us what you're imagining, and we'll create something especially for you.
          </p>
          <div className="w-16 h-[1.5px] bg-brand-rose mx-auto mt-2" />
        </div>
      </section>

      {/* Main Request Form Container */}
      <main className="max-w-3xl mx-auto px-4 py-12 flex-grow">
        {formSubmitted ? (
          // 13. Form Submission Success Panel
          <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-8 text-center space-y-6 shadow-sm animate-fade-in py-16">
            <div className="inline-flex p-3 rounded-full bg-brand-sage/10 text-brand-sage">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
                Your idea has been received!
              </h2>
              <p className="text-sm text-brand-rose font-medium">
                We'll get back to you soon. ♡
              </p>
            </div>
            <p className="text-xs sm:text-sm text-brand-cocoa/85 max-w-md mx-auto leading-relaxed">
              Thank you for sharing your thoughts with us. We will review your customization details and contact you via email ({BRAND_CONFIG.email}) or WhatsApp ({BRAND_CONFIG.phoneFormatted}) within 24 hours to discuss options and share pricing.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => setFormSubmitted(false)}
                className="bg-brand-rose text-brand-cream hover:bg-brand-cocoa transition-colors font-bold text-xs uppercase tracking-wider py-3 px-6 rounded"
              >
                Submit Another Request
              </button>
              <button
                onClick={() => router.push('/shop')}
                className="bg-brand-offwhite border border-brand-beige text-brand-cocoa hover:bg-brand-beige transition-colors font-bold text-xs uppercase tracking-wider py-3 px-6 rounded"
              >
                Browse Shop
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-brand-offwhite border border-brand-beige rounded-lg p-6 sm:p-8 shadow-sm">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-cocoa border-b border-brand-beige/50 pb-4 mb-6 flex items-center space-x-2">
              <Sparkles className="text-brand-rose" size={20} />
              <span>Tell Us What You're Imagining</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Customer contact fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-brand-cream border border-brand-beige rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-brand-cream border border-brand-beige rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">
                    Phone Number (WhatsApp Preferred) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Your Phone Number"
                    className="w-full bg-brand-cream border border-brand-beige rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">
                    Product Type
                  </label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full bg-brand-cream border border-brand-beige rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa"
                  >
                    <option value="Crochet Keychain">Crochet Keychain (Butterfly, Evil Eye, etc.)</option>
                    <option value="Crochet Flowers">Crochet Flowers (Sunflower, Rose, Lavender, etc.)</option>
                    <option value="Crochet Bookmark">Crochet Bookmark (Flower stem, leaf, etc.)</option>
                    <option value="Crochet Accessory">Crochet Accessory (Hair bow clips, etc.)</option>
                    <option value="Custom Gift Box Bundle">Custom Gift Box (Multi-product bundle)</option>
                    <option value="Other Crochet Request">Other Crochet Creation</option>
                  </select>
                </div>
              </div>

              {/* Occasion & colors fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">
                    Occasion / Event
                  </label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full bg-brand-cream border border-brand-beige rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa"
                  >
                    <option value="Personal Use">Personal Use / Keepsake</option>
                    <option value="Birthday Gift">Birthday Gift</option>
                    <option value="Anniversary Gift">Anniversary Gift</option>
                    <option value="Friendship / Appreciation">Friendship / Thank You</option>
                    <option value="Festival / Special Event">Festival / Holiday</option>
                    <option value="Other Special Occasion">Other Special Gifting</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">
                    Preferred Colors / Palette
                  </label>
                  <input
                    type="text"
                    value={preferredColor}
                    onChange={(e) => setPreferredColor(e.target.value)}
                    placeholder="e.g. Lavender & cream, pastel pinks"
                    className="w-full bg-brand-cream border border-brand-beige rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa"
                  />
                </div>
              </div>

              {/* Quantity, Budget & Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-brand-cream border border-brand-beige rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">
                    Budget Range
                  </label>
                  <select
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full bg-brand-cream border border-brand-beige rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa"
                  >
                    <option value="Under ₹500">Under ₹500</option>
                    <option value="₹500 - ₹1000">₹500 - ₹1,000</option>
                    <option value="₹1000 - ₹2000">₹1,000 - ₹2,000</option>
                    <option value="₹2000+">₹2,000+ (Bulk / Large Gift Bundles)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">
                    Required Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="w-full bg-brand-cream border border-brand-beige rounded-md px-3.5 py-2.5 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa"
                  />
                </div>
              </div>

              {/* Reference image placeholder */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">
                  Reference Image Link / Description (Optional)
                </label>
                <input
                  type="text"
                  value={refImage}
                  onChange={(e) => setRefImage(e.target.value)}
                  placeholder="Paste an image URL or describe product styles"
                  className="w-full bg-brand-cream border border-brand-beige rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa placeholder-brand-cocoa/40"
                />
              </div>

              {/* Customization Details textarea */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">
                  Customization Details *
                </label>
                <textarea
                  required
                  rows={4}
                  value={customizationDetails}
                  onChange={(e) => setCustomizationDetails(e.target.value)}
                  placeholder="Describe your vision: size, initials, specific stitching pattern, or color combinations. The more details, the better!"
                  className="w-full bg-brand-cream border border-brand-beige rounded-md p-3.5 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa placeholder-brand-cocoa/40"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">
                  Additional Message for Creator (Optional)
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. 'This is for my sister's graduation!'"
                  className="w-full bg-brand-cream border border-brand-beige rounded-md p-3.5 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa placeholder-brand-cocoa/40"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {/* Submit trigger button */}
              <div className="pt-4 border-t border-brand-beige/50">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-rose hover:bg-brand-cocoa text-brand-cream transition-colors font-bold text-sm py-4 px-6 rounded flex items-center justify-center space-x-2.5 shadow-sm"
                >
                  <Sparkles size={16} />
                  <span>{loading ? 'Sending Request...' : 'Send Custom Request'}</span>
                </button>
              </div>

            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

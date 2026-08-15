'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, ShoppingBag, ArrowRight, Check, MessageSquare, ChevronRight, Sparkles } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { BRAND_CONFIG } from '@/config/brand';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetails({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug;
  
  const router = useRouter();
  const { products, reviews, submitReview, user, setShowAuthModal, setAuthRedirectAction } = useStore();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Find the product
  const product = products.find((p) => p.slug === slug && p.status === 'active');

  // Local state
  const [activeImage, setActiveImage] = useState<string>('');
  const [selectedCustomization, setSelectedCustomization] = useState<string>('');
  const [personalizationText, setPersonalizationText] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [buyNowNotice, setBuyNowNotice] = useState(false);

  // Review Form state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Set default state values on product load
  useEffect(() => {
    if (product) {
      setActiveImage(product.images[0]);
      if (product.customization_available && product.personalization_options) {
        setSelectedCustomization(product.personalization_options[0]);
      }
    }
  }, [product]);

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <AnnouncementBar />
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6 flex-grow flex flex-col justify-center items-center">
          <span className="text-4xl text-brand-rose/60">✿</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
            Looks like this little piece wandered away.
          </h1>
          <p className="text-sm text-brand-cocoa/70 max-w-sm">
            We couldn't find the product page you were looking for. It might have been retired or moved.
          </p>
          <button
            onClick={() => router.push('/shop')}
            className="bg-brand-rose text-brand-cream hover:bg-brand-cocoa transition-colors font-semibold text-xs tracking-wider uppercase py-3 px-8 rounded shadow"
          >
            Back to Shop
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);
  const isUnavailable = product.availability_status === 'temporarily_unavailable';
  const isSoldOut = isUnavailable; // Alias for button check consistency

  // Filter approved reviews for this product
  const productReviews = reviews.filter((r) => r.productId === product.id && r.approved);
  
  // Calculate average rating
  const averageRating =
    productReviews.length > 0
      ? (productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length).toFixed(1)
      : '5.0';

  const handleAddToCart = () => {
    if (isSoldOut) return;
    
    // Combine selected options and text personalization
    let options = '';
    if (product.customization_available) {
      const items = [];
      if (selectedCustomization) items.push(selectedCustomization);
      if (personalizationText.trim()) items.push(`Name: "${personalizationText.trim()}"`);
      options = items.join(', ');
    }

    addToCart(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        customization: options || undefined,
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    if (isSoldOut) return;
    
    const action = () => {
      handleAddToCart();
      setBuyNowNotice(true);
      setTimeout(() => {
        router.push('/cart');
      }, 500);
    };

    if (!user) {
      setAuthRedirectAction(() => action);
      setShowAuthModal(true);
      return;
    }

    action();
  };

  const handleAddToCartClick = () => {
    const action = () => {
      handleAddToCart();
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 2000);
    };

    if (!user) {
      setAuthRedirectAction(() => action);
      setShowAuthModal(true);
      return;
    }

    action();
  };

  const handleWishlistToggle = () => {
    if (!user) {
      setAuthRedirectAction(() => {
        toggleWishlist(product.id);
      });
      setShowAuthModal(true);
      return;
    }
    toggleWishlist(product.id);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    const action = () => {
      submitReview({
        productId: product.id,
        customerName: reviewName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviewName('');
      setReviewComment('');
      setReviewRating(5);
      alert('Thank you! Your review has been submitted for admin approval. ♡');
    };

    if (!user) {
      setAuthRedirectAction(() => action);
      setShowAuthModal(true);
      return;
    }

    action();
  };

  // WhatsApp prefilled URL generation
  const handleWhatsAppOrder = () => {
    const whatsappNum = '91' + BRAND_CONFIG.whatsappNumber;
    let customizationStr = 'None';
    if (product.customization_available) {
      const items = [];
      if (selectedCustomization) items.push(selectedCustomization);
      if (personalizationText.trim()) items.push(`Personalization: "${personalizationText.trim()}"`);
      customizationStr = items.join(', ');
    }

    const message = `Hi Neeshiartique, I am interested in ordering ${product.name}. I would like ${quantity} item(s). I would also like ${customizationStr}. (Price: ₹${product.price * quantity})`;
    const url = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Navbar */}
      <Navbar />

      {/* Breadcrumbs navigation */}
      <div className="bg-brand-cream border-b border-brand-beige/30 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-brand-cocoa/65">
          <Link href="/" className="hover:text-brand-rose transition-colors">Home</Link>
          <ChevronRight size={10} />
          <Link href="/shop" className="hover:text-brand-rose transition-colors">Shop</Link>
          <ChevronRight size={10} />
          <span className="text-brand-rose font-bold truncate max-w-[150px] sm:max-w-none">{product.name}</span>
        </div>
      </div>

      {/* Details Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square rounded-lg border border-brand-beige overflow-hidden bg-brand-beige/5">
              <Image
                src={activeImage || product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Thumbnail Selectors */}
            {product.images.length > 1 && (
              <div className="flex space-x-3">
                {product.images.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`relative w-20 aspect-square rounded border overflow-hidden bg-brand-cream transition-all duration-200 ${
                      activeImage === imgUrl ? 'border-brand-rose scale-[1.03] shadow-sm' : 'border-brand-beige hover:border-brand-rose/50'
                    }`}
                  >
                    <Image
                      src={imgUrl}
                      alt={`${product.name} Gallery ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information Panel */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-bold tracking-widest text-brand-rose uppercase block">
                {product.category_id.replace('-', ' ')}
              </span>
              
              <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-tight text-brand-cocoa">
                {product.name}
              </h1>

              {/* Review Stars & Stock indicators */}
              <div className="flex items-center space-x-4 text-xs font-semibold">
                <div className="flex items-center space-x-1 text-brand-rose">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        fill={s <= Math.round(Number(averageRating)) ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <span>{averageRating} ({productReviews.length} reviews)</span>
                </div>
                
                <span className="text-brand-cocoa/30">|</span>
                
                {isUnavailable ? (
                  <span className="text-brand-rose uppercase tracking-wider font-bold">Currently Unavailable</span>
                ) : (
                  <span className="text-brand-sage uppercase tracking-wider font-bold flex items-center space-x-1.5">
                    <span>Made to Order ♡</span>
                    <span className="text-brand-cocoa/40 font-normal">· Usually ready in {product.preparation_time || '3–5 days'}</span>
                  </span>
                )}
              </div>

              {/* Pricing details */}
              <div className="flex items-baseline space-x-3 pt-2">
                <span className="text-2xl font-bold text-brand-cocoa">₹{product.price}</span>
                {product.compare_at_price && (
                  <span className="text-sm text-brand-cocoa/50 line-through">₹{product.compare_at_price}</span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-sm text-brand-cocoa/80 leading-relaxed">
                {product.description}
              </p>

              {/* Customizable Details */}
              {product.customization_available && (
                <div className="space-y-4 pt-4 border-t border-brand-beige/50">
                  <span className="text-[10px] font-bold tracking-wider text-brand-rose uppercase block">
                    ✿ Customization Welcome
                  </span>
                  
                  {product.personalization_options && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wide">
                        Choose Base Color Combination
                      </label>
                      <select
                        value={selectedCustomization}
                        onChange={(e) => setSelectedCustomization(e.target.value)}
                        className="w-full bg-brand-offwhite border border-brand-beige text-brand-cocoa text-sm rounded-md px-3 py-2.5 focus:outline-none focus:border-brand-rose"
                      >
                        {product.personalization_options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Personalization text field */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wide">
                      Add a name, word, or custom detail (Optional)
                    </label>
                    <input
                      type="text"
                      value={personalizationText}
                      onChange={(e) => setPersonalizationText(e.target.value)}
                      placeholder="e.g., 'Letters S & B' or 'Light Pink flowers'"
                      maxLength={60}
                      className="w-full bg-brand-offwhite border border-brand-beige text-brand-cocoa text-sm rounded-md px-4 py-2.5 focus:outline-none focus:border-brand-rose placeholder-brand-cocoa/40"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* CTA action buttons */}
            <div className="space-y-4 pt-6 border-t border-brand-beige/50">
              
              {/* Quantity Selector */}
              {!isSoldOut && (
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-bold text-brand-cocoa uppercase tracking-wider">
                    Quantity
                  </span>
                  <div className="flex items-center border border-brand-beige rounded bg-brand-offwhite">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-brand-cocoa hover:text-brand-rose transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 text-sm font-semibold text-brand-cocoa">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1.5 text-brand-cocoa hover:text-brand-rose transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons row */}
              <div className="flex flex-col sm:flex-row items-stretch gap-3">
                {isUnavailable ? (
                  <div className="flex-grow space-y-3">
                    <button
                      disabled
                      className="w-full bg-brand-beige text-brand-cocoa/40 font-bold text-sm py-4 px-6 rounded cursor-not-allowed border border-brand-beige text-center"
                    >
                      Currently Unavailable
                    </button>
                    <p className="text-xs text-brand-rose font-semibold text-center bg-rose-50 p-3 rounded border border-rose-100">
                      This crochet piece is temporarily unavailable. Please check back soon or contact us for a custom request.
                    </p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleAddToCartClick}
                      className="flex-grow bg-brand-rose hover:bg-brand-cocoa text-brand-cream transition-colors font-bold text-sm py-4 px-6 rounded flex items-center justify-center space-x-2 shadow-sm"
                    >
                      {addedNotice ? (
                        <>
                          <Check size={16} />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={16} />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleBuyNow}
                      className="flex-grow bg-brand-cocoa hover:bg-brand-rose text-brand-cream transition-colors font-bold text-sm py-4 px-6 rounded flex items-center justify-center space-x-2 shadow-sm"
                    >
                      {buyNowNotice ? (
                        <span>Taking you to checkout...</span>
                      ) : (
                        <span>Buy It Now</span>
                      )}
                    </button>
                  </>
                )}

                {/* Wishlist toggle */}
                <button
                  onClick={handleWishlistToggle}
                  className={`p-3.5 rounded border border-brand-beige bg-brand-offwhite hover:bg-brand-cream flex items-center justify-center transition-all ${
                    isSaved ? 'text-brand-rose border-brand-rose/25 bg-brand-rose/5' : 'text-brand-cocoa'
                  }`}
                  aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart size={20} fill={isSaved ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* WhatsApp Order Option */}
              <button
                onClick={handleWhatsAppOrder}
                className="w-full bg-brand-sage hover:bg-brand-rose text-brand-cream transition-colors font-bold text-sm py-3 px-6 rounded flex items-center justify-center space-x-2.5 shadow-sm"
              >
                <MessageSquare size={16} />
                <span>Order via WhatsApp</span>
              </button>

              {/* Made Especially For You Info */}
              {!isUnavailable && (
                <div className="bg-brand-beige/10 border border-brand-beige/50 rounded-lg p-4 space-y-1.5 mt-4">
                  <h4 className="font-serif text-sm font-bold text-brand-cocoa flex items-center space-x-1.5">
                    <Sparkles size={14} className="text-brand-rose" />
                    <span>Made Especially For You</span>
                  </h4>
                  <p className="text-xs text-brand-cocoa/85 leading-relaxed">
                    Every piece is crocheted after your order is placed, so your creation is made especially for you. ♡
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab accordions sections */}
        <section className="mt-16 max-w-4xl space-y-3">
          
          <details className="group border border-brand-beige rounded-md bg-brand-offwhite overflow-hidden" open>
            <summary className="flex items-center justify-between p-4 cursor-pointer select-none font-serif text-base font-bold text-brand-cocoa hover:text-brand-rose transition-colors">
              <span>Handmade details & Materials</span>
              <span className="text-xs transition-transform duration-200 group-open:rotate-90">➔</span>
            </summary>
            <div className="p-4 pt-0 border-t border-brand-beige/30 text-sm text-brand-cocoa/85 space-y-4">
              <div>
                <h4 className="font-bold mb-1">Materials Used:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {product.materials.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
              {product.preparation_time && (
                <p>
                  <strong className="font-bold">Preparation Time:</strong> {product.preparation_time} (handmade to order).
                </p>
              )}
            </div>
          </details>

          <details className="group border border-brand-beige rounded-md bg-brand-offwhite overflow-hidden">
            <summary className="flex items-center justify-between p-4 cursor-pointer select-none font-serif text-base font-bold text-brand-cocoa hover:text-brand-rose transition-colors">
              <span>Care Instructions</span>
              <span className="text-xs transition-transform duration-200 group-open:rotate-90">➔</span>
            </summary>
            <div className="p-4 pt-0 border-t border-brand-beige/30 text-sm text-brand-cocoa/85">
              <ul className="list-decimal pl-5 space-y-1.5">
                {product.care_instructions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </details>

          <details className="group border border-brand-beige rounded-md bg-brand-offwhite overflow-hidden">
            <summary className="flex items-center justify-between p-4 cursor-pointer select-none font-serif text-base font-bold text-brand-cocoa hover:text-brand-rose transition-colors">
              <span>Shipping & Returns</span>
              <span className="text-xs transition-transform duration-200 group-open:rotate-90">➔</span>
            </summary>
            <div className="p-4 pt-0 border-t border-brand-beige/30 text-sm text-brand-cocoa/85 space-y-3 leading-relaxed">
              <p>
                <strong>Shipping Time:</strong> Estimated {product.shipping_time || '3-5 days'} delivery across India. Shipping details are emailed upon packaging confirmation.
              </p>
              <p>
                <strong>Handmade Policy:</strong> Because each piece is custom or small-batch created with care, we do not accept general returns. However, if your package arrives damaged, please contact us immediately, and we will happily stitch or paint a replacement for you.
              </p>
            </div>
          </details>
        </section>

        {/* 16. Handmade Trust Info card banner */}
        <section className="mt-10 max-w-4xl bg-brand-beige/30 border border-brand-beige rounded-md p-5 sm:p-6 flex items-start space-x-4">
          <span className="text-brand-rose text-2xl mt-0.5">✿</span>
          <div className="space-y-1.5">
            <h4 className="font-serif text-base font-bold text-brand-cocoa">
              Every piece is slightly unique.
            </h4>
            <p className="text-xs sm:text-sm text-brand-cocoa/80 leading-relaxed">
              Because this is a handmade creation, your product may feature small stitching patterns or watercolor shapes that vary slightly from the product photography. These small differences make every single piece authentic, special, and uniquely yours.
            </p>
          </div>
        </section>

        {/* Reviews panel */}
        <section className="mt-16 border-t border-brand-beige/50 pt-12 max-w-4xl space-y-10">
          <div>
            <h3 className="font-serif text-2xl font-bold text-brand-cocoa mb-6">
              Customer Reviews
            </h3>

            {productReviews.length === 0 ? (
              <p className="text-sm italic text-brand-cocoa/60">
                No reviews approved yet. Be the first to share your thoughts! ♡
              </p>
            ) : (
              <div className="space-y-6">
                {productReviews.map((rev) => (
                  <div key={rev.id} className="border-b border-brand-beige/40 pb-5">
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-sm font-semibold text-brand-cocoa">{rev.customerName}</strong>
                      <span className="text-xs text-brand-cocoa/50 font-medium">{rev.date}</span>
                    </div>
                    <div className="flex items-center space-x-0.5 text-brand-rose mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} fill={s <= rev.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <p className="text-sm text-brand-cocoa/80 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Review Form */}
          <div className="bg-brand-beige/15 border border-brand-beige rounded-lg p-6 space-y-4">
            <h4 className="font-serif text-lg font-bold text-brand-cocoa">
              Share Your Thoughts
            </h4>
            
            {reviewSubmitted ? (
              <div className="text-sm font-medium text-brand-rose py-4 flex items-center space-x-2">
                <span>Thank you! Your review has been submitted and is awaiting approval. ♡</span>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="Your Name"
                      required
                      className="w-full bg-brand-cream border border-brand-beige text-brand-cocoa text-sm rounded px-3.5 py-2.5 focus:outline-none focus:border-brand-rose"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">
                      Rating
                    </label>
                    <div className="flex items-center space-x-2">
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="bg-brand-cream border border-brand-beige text-brand-cocoa text-sm rounded px-3 py-2.5 focus:outline-none focus:border-brand-rose font-semibold"
                      >
                        <option value={5}>★★★★★ (5 Stars)</option>
                        <option value={4}>★★★★☆ (4 Stars)</option>
                        <option value={3}>★★★☆☆ (3 Stars)</option>
                        <option value={2}>★★☆☆☆ (2 Stars)</option>
                        <option value={1}>★☆☆☆☆ (1 Star)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">
                    Your Review
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us what you liked about this handmade item..."
                    required
                    rows={4}
                    className="w-full bg-brand-cream border border-brand-beige text-brand-cocoa text-sm rounded p-3.5 focus:outline-none focus:border-brand-rose placeholder-brand-cocoa/40"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-brand-cocoa hover:bg-brand-rose text-brand-cream transition-colors font-bold text-xs uppercase tracking-wider py-3 px-6 rounded"
                >
                  Submit Review
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

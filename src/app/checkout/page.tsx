'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, Truck, CreditCard, Landmark, Check, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import AnnouncementBar from '@/components/AnnouncementBar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Checkout() {
  const router = useRouter();
  const { cartItems, subtotal, shipping, couponDiscount, total, clearCart } = useCart();
  const { placeOrder } = useStore();

  // Form input states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');
  const [notes, setNotes] = useState('');
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');

  // Checkout modal processing states
  const [processing, setProcessing] = useState(false);
  const [showMockGateway, setShowMockGateway] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim() || !address.trim() || !city.trim() || !pincode.trim()) {
      alert('Please fill in all required shipping fields.');
      return;
    }

    if (paymentMethod === 'cod') {
      // Direct placement for COD
      processOrderPlacement('pending');
    } else {
      // Open Mock Razorpay Gateway
      setShowMockGateway(true);
      setGatewayStatus('processing');
      setTimeout(() => {
        setGatewayStatus('idle'); // prompt user input inside the gateway
      }, 1000);
    }
  };

  const processOrderPlacement = (paymentStatus: 'pending' | 'paid') => {
    setProcessing(true);
    
    const orderItems = cartItems.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
      customization: item.customization,
    }));

    const shippingAddress = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim() || 'N/A',
      pincode: pincode.trim(),
      country,
    };

    // Place order in StoreContext
    const placed = placeOrder({
      customer_id: 'guest',
      items: orderItems,
      subtotal,
      shipping,
      discount: couponDiscount,
      total,
      payment_status: paymentStatus,
      order_status: 'pending',
      shipping_address: shippingAddress,
      notes: notes.trim() || undefined,
    });

    setTimeout(() => {
      clearCart();
      setProcessing(false);
      router.push(`/order-confirmation?id=${placed.id}`);
    }, 1200);
  };

  const handleMockPaymentSuccess = () => {
    setGatewayStatus('processing');
    setTimeout(() => {
      setGatewayStatus('success');
      setTimeout(() => {
        setShowMockGateway(false);
        processOrderPlacement('paid');
      }, 1000);
    }, 1500);
  };

  const handleMockPaymentFailure = () => {
    setGatewayStatus('processing');
    setTimeout(() => {
      setGatewayStatus('failed');
      setTimeout(() => {
        setGatewayStatus('idle');
        setErrorMessage('Simulated Card Decline: Payment authorization failed. Please try again or select Cash on Delivery.');
      }, 1500);
    }, 1200);
  };

  if (cartItems.length === 0 && !processing) {
    return (
      <div className="flex flex-col min-h-screen">
        <AnnouncementBar />
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6 flex-grow flex flex-col justify-center items-center">
          <span className="text-4xl text-brand-rose/60">✿</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-cocoa">
            No items in your basket to checkout.
          </h1>
          <button
            onClick={() => router.push('/shop')}
            className="bg-brand-rose text-brand-cream hover:bg-brand-cocoa transition-colors font-bold text-xs uppercase tracking-wider py-3 px-8 rounded shadow"
          >
            Back to Shop
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Announcement Bar */}
      <AnnouncementBar />

      {/* Navbar */}
      <Navbar />

      {/* Checkout Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <h1 className="font-serif text-3xl font-bold text-brand-cocoa mb-8">
          Checkout Details
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left: Input Forms */}
          <div className="lg:col-span-8">
            <form onSubmit={handleFormSubmit} className="space-y-8">
              
              {/* Step 1: Customer Details */}
              <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-6 shadow-sm space-y-4">
                <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2">
                  1. Contact Information
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sagar Patidar"
                      className="w-full bg-brand-cream border border-brand-beige rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sagar@example.com"
                      className="w-full bg-brand-cream border border-brand-beige rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-brand-cream border border-brand-beige rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa"
                  />
                </div>
              </div>

              {/* Step 2: Shipping Address */}
              <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-6 shadow-sm space-y-4">
                <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2 flex items-center space-x-2">
                  <Truck size={18} className="text-brand-rose" />
                  <span>2. Delivery Address</span>
                </h2>
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Flat/House No, Colony/Area, Landmark"
                    className="w-full bg-brand-cream border border-brand-beige rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-2 sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Bengaluru"
                      className="w-full bg-brand-cream border border-brand-beige rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">State *</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Karnataka"
                      className="w-full bg-brand-cream border border-brand-beige rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">Pincode *</label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="e.g. 560102"
                      className="w-full bg-brand-cream border border-brand-beige rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">Country</label>
                  <input
                    type="text"
                    disabled
                    value={country}
                    className="w-full bg-brand-beige/50 border border-brand-beige rounded px-3 py-2 text-sm cursor-not-allowed text-brand-cocoa/50 font-semibold"
                  />
                </div>

                {/* Notes details */}
                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-bold text-brand-cocoa uppercase tracking-wider">Special Instructions / Gift Message (Optional)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. 'Write happy birthday to Tanu on the tag!' or 'Leave parcel with security.'"
                    className="w-full bg-brand-cream border border-brand-beige rounded p-3 text-sm focus:outline-none focus:border-brand-rose text-brand-cocoa placeholder-brand-cocoa/40"
                  />
                </div>
              </div>

              {/* Step 3: Payment Section */}
              <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-6 shadow-sm space-y-4">
                <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2">
                  3. Payment Method
                </h2>

                {errorMessage && (
                  <div className="p-3.5 bg-brand-rose/5 border border-brand-rose/25 rounded flex items-center space-x-2 text-xs text-brand-rose font-semibold">
                    <AlertTriangle size={16} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Razorpay selector */}
                  <label
                    className={`border rounded-lg p-4 flex items-start space-x-3 cursor-pointer transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-brand-rose bg-brand-rose/5'
                        : 'border-brand-beige bg-brand-cream hover:border-brand-rose/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_opt"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="accent-brand-rose mt-1"
                    />
                    <div className="space-y-1">
                      <span className="font-serif text-sm font-bold text-brand-cocoa flex items-center space-x-1.5">
                        <CreditCard size={15} />
                        <span>Razorpay Secure Gateway</span>
                      </span>
                      <span className="text-[10px] text-brand-cocoa/70 block">
                        Supports Cards, UPI, Net Banking, and GPay
                      </span>
                    </div>
                  </label>

                  {/* Cash on Delivery selector */}
                  <label
                    className={`border rounded-lg p-4 flex items-start space-x-3 cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-brand-rose bg-brand-rose/5'
                        : 'border-brand-beige bg-brand-cream hover:border-brand-rose/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_opt"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-brand-rose mt-1"
                    />
                    <div className="space-y-1">
                      <span className="font-serif text-sm font-bold text-brand-cocoa flex items-center space-x-1.5">
                        <Landmark size={15} />
                        <span>Cash on Delivery</span>
                      </span>
                      <span className="text-[10px] text-brand-cocoa/70 block">
                        Pay in cash upon doorstep package delivery
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Checkout Trigger CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-brand-rose hover:bg-brand-cocoa text-brand-cream transition-colors font-bold text-sm py-4 px-6 rounded flex items-center justify-center space-x-2 shadow-sm"
                >
                  {processing ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Creating Order...</span>
                    </>
                  ) : (
                    <>
                      <span>{paymentMethod === 'cod' ? 'Confirm Cash Order' : 'Proceed to Razorpay'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Right: Checkout summary card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-brand-beige rounded-lg bg-brand-offwhite p-5 sm:p-6 shadow-sm space-y-6">
              <h2 className="font-serif text-lg font-bold text-brand-cocoa border-b border-brand-beige/50 pb-2">
                In Your Basket
              </h2>
              
              <div className="divide-y divide-brand-beige/20 text-xs">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-3">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-brand-cocoa">{item.name}</h4>
                      {item.customization && (
                        <span className="text-[9px] font-semibold text-brand-rose block">
                          ✿ {item.customization}
                        </span>
                      )}
                      <span className="text-brand-cocoa/60 font-medium">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-semibold text-brand-cocoa self-start">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-brand-beige/50 pt-4 space-y-2 text-xs font-semibold">
                <div className="flex justify-between text-brand-cocoa/85">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-brand-cocoa/85">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-brand-rose">
                    <span>Discount</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="border-t border-brand-beige/40 pt-2 flex justify-between text-sm font-bold text-brand-cocoa">
                  <span>Grand Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>

            <div className="border border-brand-beige rounded-lg p-4 bg-brand-beige/10 flex items-center space-x-2 text-[10px] font-semibold text-brand-cocoa/75 uppercase tracking-wide">
              <ShieldCheck size={18} className="text-brand-sage flex-shrink-0" />
              <span>Payments are encrypted & fully secured</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* 31. Razorpay Sandbox Mock Gateway Modal */}
      {showMockGateway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-brand-cocoa/40 backdrop-blur-sm" />

          {/* Gateway window */}
          <div className="relative bg-[#0F172A] text-slate-100 w-full max-w-md rounded-lg shadow-2xl overflow-hidden border border-slate-700 z-10 p-6 flex flex-col justify-between animate-slide-up">
            
            {/* Gateway LogoHeader */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
              <div className="flex items-center space-x-1.5">
                <span className="font-sans font-bold text-sky-400 tracking-wider text-sm">RAZORPAY</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">SANDBOX GATEWAY</span>
              </div>
              <button
                onClick={() => {
                  setShowMockGateway(false);
                  setGatewayStatus('idle');
                }}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                Cancel
              </button>
            </div>

            {/* Gateway state details */}
            {gatewayStatus === 'processing' ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <Loader2 className="animate-spin text-sky-400" size={32} />
                <p className="text-sm font-semibold tracking-wide text-slate-300">Authorizing Secure Payment Transaction...</p>
              </div>
            ) : gatewayStatus === 'success' ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3 text-emerald-400">
                <Check className="border-2 border-emerald-400 p-1.5 rounded-full" size={48} strokeWidth={2.5} />
                <p className="text-sm font-bold tracking-wider">Payment Authorized Successfully!</p>
              </div>
            ) : gatewayStatus === 'failed' ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3 text-rose-500">
                <AlertTriangle className="border-2 border-rose-500 p-1.5 rounded-full" size={48} strokeWidth={2.5} />
                <p className="text-sm font-bold tracking-wider">Transaction Declined</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Billing Summary */}
                <div className="bg-slate-900 border border-slate-800 rounded p-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">Merchant</span>
                    <span className="text-sm font-bold text-slate-200 font-serif">Neeshiartique Store</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">Amount</span>
                    <span className="text-base font-bold text-sky-400">₹{total}</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-slate-400">
                  <p>
                    This is a <strong className="text-slate-200 font-bold">Mock payment portal</strong> simulating a real API response. Choose an option below to authorize or reject this card purchase.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={handleMockPaymentSuccess}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3 rounded shadow transition-colors"
                  >
                    Simulate Payment Success (Paid)
                  </button>
                  <button
                    onClick={handleMockPaymentFailure}
                    className="w-full bg-rose-700 hover:bg-rose-600 text-white font-bold text-sm py-3 rounded shadow transition-colors"
                  >
                    Simulate Card Decline (Declined)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Footer */}
      <Footer />
    </div>
  );
}

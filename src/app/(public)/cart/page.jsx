"use client";
import React from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Loader2,
  ArrowRight,
  Info,
} from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const { user } = useAuth();

  // ✅ শপ পেজ অনুযায়ী স্ট্যাটাস চেক
  const isActiveMember = user?.status === "active";

  // গ্র্যান্ড সাবটোটাল ক্যালকুলেশন (শপ পেজের ম্যাথমেটিক্যাল লজিক অনুযায়ী)
  const subtotal = cart.reduce((acc, item) => {
    const basePrice = Number(item.price || 0);
    const pv = Number(item.point_value || 0);

    // শপ পেজ লজিক: মেম্বার হলে (Price - PV*2), নাহলে Regular Price
    const effectivePrice = isActiveMember
      ? Math.max(0, basePrice - pv * 2)
      : basePrice;

    return acc + effectivePrice * item.quantity;
  }, 0);

  // লোডিং স্টেট
  if (loading && cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
        <p className="text-slate-600 font-bold animate-pulse">লোড হচ্ছে...</p>
      </div>
    );
  }

  // কার্ট খালি থাকলে ভিউ
  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-slate-50 p-8 rounded-full mb-6">
          <ShoppingBag size={80} className="text-slate-200" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          আপনার কার্টটি এখন খালি!
        </h2>
        <p className="text-slate-500 mt-2">
          সেরা অফারে কেনাকাটা করতে আমাদের শপ ভিজিট করুন।
        </p>
        <Link
          href="/shop"
          className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
        >
          কেনাকাটা শুরু করুন
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Shopping Cart
            </h1>
            <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full">
              {cart.length} Items
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 p-6 bg-slate-50/50 border-b text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="col-span-6">Product Details</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-3 text-right">Subtotal</div>
              </div>

              <div className="divide-y divide-slate-50">
                {cart.map((item) => {
                  const basePrice = Number(item.price || 0);
                  const pv = Number(item.point_value || 0);
                  const discountAmount = pv * 2;

                  // শপ পেজের লজিক অনুযায়ী ডিসপ্লে ভ্যালু
                  const finalPrice = isActiveMember
                    ? Math.max(0, basePrice - discountAmount)
                    : basePrice;

                  // মেম্বাররা ডিসকাউন্ট পেলে PV ০ হয়ে যায়
                  const displayPV = isActiveMember ? 0 : pv;

                  const itemTotal = finalPrice * item.quantity;

                  return (
                    <div
                      key={item.cartItemId || item.id}
                      className="p-6 grid grid-cols-1 md:grid-cols-12 items-center gap-4 hover:bg-slate-50/50 transition-colors"
                    >
                      {/* Product Info */}
                      <div className="col-span-6 flex items-center gap-4">
                        <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100">
                          <img
                            src={item.image || "/placeholder.png"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-800 line-clamp-1">
                            {item.name}
                          </h3>

                          <div className="flex flex-wrap gap-2 mt-2">
                            {/* Point Value Badge */}
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-100">
                              PV: {displayPV}
                            </span>

                            {/* Price Badge */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-slate-900">
                                ৳{finalPrice.toLocaleString()}
                              </span>
                              {isActiveMember && discountAmount > 0 && (
                                <span className="text-[10px] line-through text-slate-400 font-medium">
                                  ৳{basePrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                          {isActiveMember && (
                            <p className="text-[9px] text-orange-600 font-bold mt-1 uppercase tracking-tighter">
                              ✨ Member Discount: ৳{discountAmount} Off (PV
                              Adjusted)
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="col-span-3 flex justify-center">
                        <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100 shadow-inner">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.cartItemId, -1)
                            }
                            disabled={item.quantity <= 1}
                            className="p-1.5 hover:bg-white rounded-lg disabled:opacity-20 transition-all text-slate-600"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 font-black text-slate-800 min-w-[40px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.cartItemId, 1)
                            }
                            className="p-1.5 hover:bg-white rounded-lg transition-all text-slate-600"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal & Action */}
                      <div className="col-span-3 flex items-center justify-end gap-4">
                        <div className="text-right">
                          <span className="block font-black text-slate-900 text-lg">
                            ৳{itemTotal.toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            removeFromCart(item.id, item.cartItemId)
                          }
                          className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Checkout Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-10">
              <h2 className="text-xl font-black text-slate-800 mb-6">
                অর্ডার সামারি
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">সাবটোটাল</span>
                  <span className="font-bold text-slate-900">
                    ৳{subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">ডেলিভারি চার্জ</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold uppercase tracking-tighter">
                    Calculated at Checkout
                  </span>
                </div>

                {isActiveMember ? (
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex gap-3">
                    <div className="bg-emerald-500 p-1.5 rounded-lg h-fit text-white">
                      <Check size={14} strokeWidth={4} />
                    </div>
                    <div>
                      <p className="text-emerald-800 text-xs font-black">
                        মেম্বার অফার প্রযোজ্য
                      </p>
                      <p className="text-emerald-600 text-[10px] font-medium leading-tight">
                        আপনার স্ট্যাটাস 'Active' থাকায় আপনি স্পেশাল ক্যাশলেস
                        ডিসকাউন্ট পাচ্ছেন।
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                    <div className="bg-blue-500 p-1.5 rounded-lg h-fit text-white">
                      <Info size={14} strokeWidth={3} />
                    </div>
                    <p className="text-blue-700 text-[10px] font-bold leading-tight">
                      অ্যাকাউন্ট একটিভ করলে প্রতি প্রোডাক্টে দ্বিগুণ PV
                      ডিসকাউন্ট পাবেন।
                    </p>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      সর্বমোট
                    </span>
                    <div className="text-3xl font-black text-slate-900">
                      ৳{subtotal.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-center flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
              >
                চেকআউট করুন <ArrowRight size={20} />
              </Link>

              <p className="text-[10px] text-center text-slate-400 font-bold mt-6 uppercase tracking-widest">
                🔒 Secure 256-bit SSL Connection
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// আইকন ইম্পোর্ট না করা থাকলে লুকাসিড রিয়াক্ট থেকে Check আইকনটি অ্যাড করে নিন
const Check = ({ size, strokeWidth }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

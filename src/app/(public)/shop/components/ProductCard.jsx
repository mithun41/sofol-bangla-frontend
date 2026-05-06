"use client";

import Link from "next/link";
import { ShoppingCart, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ProductCard({ product, onAddToCart, onOrderNow }) {
  const { user } = useAuth();

  // ১. ইউজার একটিভ মেম্বার কি না তা চেক (Safe Check)
  const isActiveMember = user?.status?.toLowerCase() === "active" || user?.profile?.status?.toLowerCase() === "active";

  // ২. প্রাইস এবং ডিসকাউন্ট লজিক
  const mainPrice = Number(product.price || 0);
  const pointVal = Number(product.point_value || 0);
  const discountAmount = pointVal * 2;

  // ৩. ফাইনাল ডিসপ্লে প্রাইস নির্ধারণ
  // একটিভ হলে: ৪০০০ - ১৮০০ = ২২০০
  // একটিভ না হলে: ৪০০০
  const displayPrice = isActiveMember ? (mainPrice - discountAmount) : mainPrice;
  const originalPrice = mainPrice;

  const outOfStock = Number(product.stock || 0) <= 0;

  // কার্টে ডাটা পাঠানোর জন্য হেল্পার
  const handleAction = (callback) => {
    callback({
      ...product,
      price: displayPrice,
      point_value: isActiveMember ? 0 : pointVal, // একটিভ মেম্বার হলে পিভি ০
      quantity: 1
    });
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-[#FF620A]/40 hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* ইমেজ সেকশন */}
      <div className="relative aspect-[3/4] bg-slate-50 overflow-hidden">
        <Link href={`/shop/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        {/* ডাইনামিক ব্যাজ লজিক */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {outOfStock ? (
            <span className="bg-slate-800/80 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
              Sold Out
            </span>
          ) : (
            <>
              {isActiveMember && discountAmount > 0 ? (
                <span className="bg-[#007A55] text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide shadow-lg flex items-center gap-1">
                  <Zap size={10} fill="white" className="animate-pulse" />
                  ৳{discountAmount} OFF
                </span>
              ) : (
                pointVal > 0 && (
                  <span className="bg-[#FF620A] text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide shadow-lg">
                    +{pointVal} PV
                  </span>
                )
              )}
            </>
          )}
        </div>

        {/* Hover Add to Cart (Desktop) */}
        {!outOfStock && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={() => handleAction(onAddToCart)}
              className="w-full py-3 bg-slate-900/90 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingCart size={13} />
              Add to Cart
            </button>
          </div>
        )}
      </div>

      {/* প্রোডাক্ট ইনফো */}
      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/shop/${product.id}`}>
          <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug hover:text-[#FF620A] transition-colors mb-2">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto">
          <div className="flex items-end justify-between">
            <div>
              {/* সেল প্রাইস (২২০০) */}
              <p className="text-base font-black text-[#007a55]">
                ৳{Number(displayPrice).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </p>

              {/* অরিজিনাল প্রাইস (৪০০০) - শুধু একটিভ মেম্বারদের জন্য কাটা অবস্থায় দেখাবে */}
              {isActiveMember && discountAmount > 0 && (
                <p className="text-[11px] text-slate-400 line-through mt-0.5">
                  ৳{Number(originalPrice).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </p>
              )}

              {/* একটিভ না হলে PV আর্নিং দেখাবে */}
              {!isActiveMember && pointVal > 0 && (
                <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                  Get {pointVal} PV
                </p>
              )}
            </div>

            {/* Mobile Cart Button */}
            {!outOfStock && (
              <button
                onClick={() => handleAction(onAddToCart)}
                className="w-9 h-9 flex items-center justify-center bg-orange-50 hover:bg-[#FF620A] text-[#FF620A] hover:text-white rounded-xl transition-all border border-orange-200 lg:hidden"
              >
                <ShoppingCart size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => handleAction(onOrderNow)}
            disabled={outOfStock}
            className="mt-3 w-full py-2.5 rounded-xl bg-[#FF620A] hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white text-[11px] font-black uppercase tracking-wide transition-all shadow-sm"
          >
            {outOfStock ? "Out of Stock" : "Order Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
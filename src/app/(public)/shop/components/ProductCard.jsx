"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // AuthContext ইম্পোর্ট করুন

export default function ProductCard({ product, onAddToCart, onOrderNow }) {
  const { user } = useAuth(); // সরাসরি ইউজার ডাটা নিন

  // ১. ইউজার একটিভ মেম্বার কি না তা চেক করুন
  const isActiveMember = user?.status === "active";

  // ২. ডিসকাউন্ট লজিক (PV * 2)
  const discount = Number(product.point_value || 0) * 2;

  // ৩. ফাইনাল দাম নির্ধারণ (একটিভ মেম্বার হলে ডিসকাউন্ট হবে)
  const finalPrice = Number(product.price || 0);

  const outOfStock = Number(product.stock || 0) <= 0;

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
              {/* ইউজার একটিভ হলে "৳ ডিসকাউন্ট" ব্যাজ দেখাবে */}
              {isActiveMember && discount > 0 ? (
                <span className="bg-[#FF620A] text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide shadow-lg">
                  ৳{discount} OFF
                </span>
              ) : (
                /* ইউজার একটিভ না হলে regular PV ব্যাজ দেখাবে */
                product.point_value > 0 && (
                  <span className="bg-emerald-600 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide shadow-lg">
                    +{product.point_value} PV
                  </span>
                )
              )}
            </>
          )}
        </div>

        {/* Hover Add to Cart */}
        {!outOfStock && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={() => onAddToCart(product)}
              className="w-full py-3 bg-[#007a55] hover:bg-[#e05500] text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
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
              {/* মেইন প্রাইস */}
              <p className="text-base font-black text-[#007a55]">
                ৳{Math.floor(finalPrice).toLocaleString()}
              </p>

              {/* অফার প্রাইস থাকলে আগের প্রাইস কাটা (line-through) দেখাবে */}
              {isActiveMember && discount > 0 && (
                <p className="text-[11px] text-slate-400 line-through mt-0.5">
                  ৳{Math.floor(product.original_price).toLocaleString()}
                </p>
              )}

              {/* একটিভ না হলে "Earn PV" টেক্সট দেখাবে */}
              {!isActiveMember && product.point_value > 0 && (
                <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                  Get {product.point_value} PV
                </p>
              )}
            </div>

            {!outOfStock && (
              <button
                onClick={() => onAddToCart(product)}
                className="w-9 h-9 flex items-center justify-center bg-orange-50 hover:bg-[#FF620A] text-[#FF620A] hover:text-white rounded-xl transition-all border border-orange-200 lg:hidden"
              >
                <ShoppingCart size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => onOrderNow(product)}
            disabled={outOfStock}
            className="mt-3 w-full py-2.5 rounded-xl bg-[#FF620A] hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white text-[11px] font-black uppercase tracking-wide transition-all"
          >
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
}

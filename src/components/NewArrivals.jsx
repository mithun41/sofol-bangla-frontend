"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, ArrowRight, Loader2 } from "lucide-react";
import { getAllProducts } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

export default function NewArrivals() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ইউজারের স্ট্যাটাস চেক
  const isActiveMember = user?.status === "active";

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getAllProducts();
        const allProducts = Array.isArray(res.data)
          ? res.data
          : res.data.results;
        // লেটেস্ট ৫টি প্রোডাক্ট নেওয়া
        setProducts((allProducts || []).slice(0, 5));
      } catch (err) {
        console.error("Data loading failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddToCart = (p) => {
    const originalPrice = Number(p.price || 0);
    const pointValue = Number(p.point_value || 0);

    // লজিক: একটিভ মেম্বার হলে প্রাইস থেকে পয়েন্ট ভ্যালু বিয়োগ হবে (ডিসকাউন্ট)
    // সাধারণ ইউজার হলে পয়েন্ট ভ্যালু ০ হবে না, বরং সেটা কার্টে জমা হবে (PV হিসেবে)
    const finalPrice = isActiveMember
      ? originalPrice - pointValue
      : originalPrice;

    const cartItem = {
      ...p,
      price: finalPrice,
      // একটিভ মেম্বার ডিসকাউন্ট পেয়ে গেছে তাই তার পয়েন্ট ০
      // ইনএকটিভ মেম্বার ফুল প্রাইস দিচ্ছে তাই তার পয়েন্ট জমা থাকবে
      point_value: isActiveMember ? 0 : pointValue,
      quantity: 1,
    };

    addToCart(cartItem);

    toast.success(
      <div className="flex flex-col text-xs">
        <span className="font-bold">{p.name} added!</span>
        <span>
          {isActiveMember
            ? `Price: ৳${finalPrice} (Discount Applied)`
            : `Price: ৳${finalPrice} (+${pointValue} PV added)`}
        </span>
      </div>,
      {
        position: "bottom-right",
        style: {
          borderRadius: "12px",
          background: "#10b981",
          color: "#fff",
        },
      },
    );
  };

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );

  return (
    <section className="py-10 px-4 max-w-7xl mx-auto bg-white">
      <Toaster />

      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
          New Arrivals
        </h2>
        <Link
          href="/shop"
          className="group flex items-center gap-2 text-sm font-bold text-emerald-600"
        >
          VIEW ALL{" "}
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
        {products.map((p) => {
          const pointVal = Number(p.point_value || 0);
          const originalPrice = Number(p.price || 0);

          // ডিসপ্লে প্রাইস লজিক
          const displayPrice = isActiveMember
            ? originalPrice - pointVal
            : originalPrice;

          return (
            <div
              key={p.id}
              className="group bg-[#fcfcfc] rounded-[2rem] p-3 border border-slate-100 transition-all duration-300 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:-translate-y-1"
            >
              {/* Image Box */}
              <div className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-white mb-4">
                {/* Point/Discount Label */}
                {pointVal > 0 && (
                  <div className="absolute top-3 left-3 z-10">
                    <span
                      className={`text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-sm uppercase ${isActiveMember ? "bg-orange-500" : "bg-emerald-500"}`}
                    >
                      {isActiveMember ? `৳${pointVal} OFF` : `+${pointVal} PV`}
                    </span>
                  </div>
                )}

                <Link href={`/shop/${p.id}`} className="block w-full h-full">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </Link>

                {/* Quick Add Overlay (Desktop) */}
                <button
                  onClick={() => handleAddToCart(p)}
                  className="absolute bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md text-white py-4 font-bold text-[11px] uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={15} /> Quick Add
                </button>

                {/* Mobile Cart Icon */}
                <button
                  onClick={() => handleAddToCart(p)}
                  className="md:hidden absolute bottom-3 right-3 bg-emerald-500 text-white p-2.5 rounded-full shadow-lg active:scale-90 z-10"
                >
                  <ShoppingCart size={18} />
                </button>
              </div>

              {/* Product Info */}
              <div className="flex flex-col items-center text-center pb-2">
                <Link href={`/shop/${p.id}`} className="w-full px-1">
                  <h3 className="text-[13px] font-bold text-slate-800 mb-1.5 truncate group-hover:text-emerald-600 transition-colors">
                    {p.name}
                  </h3>
                </Link>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-emerald-600 font-black text-sm">
                    Tk {Math.floor(displayPrice)}.00
                  </span>
                  {isActiveMember && pointVal > 0 && (
                    <span className="text-slate-400 text-[10px] line-through decoration-slate-300">
                      Tk {originalPrice}.00
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

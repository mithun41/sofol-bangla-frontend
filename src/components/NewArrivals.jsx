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

  const isActiveMember = user?.status === "active";

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getAllProducts();
        const allProducts = Array.isArray(res.data)
          ? res.data
          : res.data.results;

        setProducts((allProducts || []).slice(0, 6));
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
    const finalPrice = isActiveMember
      ? originalPrice - pointValue
      : originalPrice;

    const cartItem = {
      ...p,
      price: finalPrice,
      point_value: isActiveMember ? 0 : pointValue,
      quantity: 1,
    };

    addToCart(cartItem);
    toast.success(`${p.name} added to cart!`, {
      position: "bottom-right",
    });
  };

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );

  return (
    <section className="py-12 px-4 max-w-[1400px] mx-auto bg-white">
      <Toaster />

      {/* Header - ইমেজ এর মতো টাইটেল ও সাবটাইটেল */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              New Arrivals
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              The latest arrivals this week
            </p>
          </div>
          <Link
            href="/shop"
            className="group flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            VIEW ALL{" "}
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>

      {/* Grid - রেসপন্সিভ ৬ কলাম লেআউট */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {products.map((p) => {
          const pointVal = Number(p.point_value || 0);
          const originalPrice = Number(p.price || 0);
          const displayPrice = isActiveMember
            ? originalPrice - pointVal
            : originalPrice;

          return (
            <div key={p.id} className="group flex flex-col">
              {/* Image Container - Rounded Corners like photo */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F3F4F6] mb-3 border border-transparent group-hover:border-slate-200 transition-all">
                {/* Point/Discount Badge - Top Left */}
                {pointVal > 0 && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-[#E11D48] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                      {isActiveMember ? `৳${pointVal} OFF` : `+${pointVal} PV`}
                    </span>
                  </div>
                )}

                <Link href={`/shop/${p.id}`} className="block w-full h-full">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>

                {/* Quick Add Overlay (Desktop) - Photo style */}
                <button
                  onClick={() => handleAddToCart(p)}
                  className="absolute bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm text-white py-3 font-bold text-[10px] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex items-center justify-center gap-2"
                >
                  Quick Add +
                </button>

                {/* Mobile Cart Icon */}
                <button
                  onClick={() => handleAddToCart(p)}
                  className="md:hidden absolute bottom-2 right-2 bg-white/90 p-2 rounded-full shadow-md active:scale-90 z-10"
                >
                  <ShoppingCart size={14} className="text-slate-800" />
                </button>
              </div>

              {/* Product Info - Left Aligned like photo */}
              <div className="flex flex-col text-left space-y-1">
                <Link href={`/shop/${p.id}`}>
                  <h3 className="text-[13px] font-semibold text-slate-800 line-clamp-1 hover:text-emerald-600 transition-colors">
                    {p.name}
                  </h3>
                </Link>

                <div className="flex items-center flex-wrap gap-x-2">
                  <span className="text-[#E11D48] font-bold text-sm">
                    Tk {Math.floor(displayPrice).toLocaleString()}
                  </span>
                  {pointVal > 0 && (
                    <span className="text-slate-400 text-[11px] line-through">
                      Tk {originalPrice.toLocaleString()}
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

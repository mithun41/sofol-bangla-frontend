"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, ArrowRight, Loader2, Star } from "lucide-react";
import { getAllProducts } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

export default function FeaturedProducts() {
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

        // শুধুমাত্র is_featured: true প্রোডাক্টগুলো ফিল্টার করে প্রথম ৫টি নেওয়া
        const featured = (allProducts || [])
          .filter((p) => p.is_featured === true)
          .slice(0, 5);

        setProducts(featured);
      } catch (err) {
        console.error("Featured data loading failed", err);
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
    toast.success(`${p.name} added!`, {
      position: "bottom-right",
      style: {
        borderRadius: "12px",
        background: "#10b981",
        color: "#fff",
        fontSize: "14px",
      },
    });
  };

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-amber-500" size={40} />
      </div>
    );

  // যদি কোনো ফিচারড প্রোডাক্ট না থাকে তবে সেকশন দেখাবে না
  if (products.length === 0) return null;

  return (
    <section className="py-10 px-4 max-w-7xl mx-auto bg-white">
      <Toaster />

      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
            Featured Products
          </h2>
          <Star
            className="text-amber-500 fill-amber-500 animate-pulse"
            size={24}
          />
        </div>
      </div>

      {/* Grid - Same as New Arrivals */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
        {products.map((p) => {
          const pointVal = Number(p.point_value || 0);
          const originalPrice = Number(p.price || 0);
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
                {/* Label (Orange for Featured) */}
                {pointVal > 0 && (
                  <div className="absolute top-3 left-3 z-10">
                    <span
                      className={`text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm ${isActiveMember ? "bg-orange-500" : "bg-emerald-500"}`}
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

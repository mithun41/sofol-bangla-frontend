"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowRight, Loader2, Star, Zap } from "lucide-react";
import { getAllProducts } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

export default function FeaturedProducts() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ইউজার স্ট্যাটাস চেক (Case-insensitive)
  const isActiveMember = user?.status?.toLowerCase() === "active" || user?.profile?.status?.toLowerCase() === "active";

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getAllProducts();
        const allProducts = Array.isArray(res.data) ? res.data : res.data.results;

        const featured = (allProducts || [])
          .filter((p) => p.is_featured === true)
          .slice(0, 6);

        setProducts(featured);
      } catch (err) {
        console.error("Featured data loading failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // প্রাইস ক্যালকুলেশন লজিক (Main Price 4000 - Discount 1800 = Sell Price 2200)
  const getCalculatedPrice = (p) => {
    const mainPrice = Number(p.price || 0);
    const pointVal = Number(p.point_value || 0);
    const discountAmount = pointVal * 2;

    if (isActiveMember) {
      return {
        sellPrice: mainPrice - discountAmount, // ৪০০০ - ১৮০০ = ২২০০
        originalPrice: mainPrice,
        discount: discountAmount,
        finalPV: 0
      };
    } else {
      return {
        sellPrice: mainPrice,
        originalPrice: null,
        discount: 0,
        finalPV: pointVal
      };
    }
  };

  const handleAddToCart = (p) => {
    const { sellPrice, finalPV } = getCalculatedPrice(p);
    addToCart({
      ...p,
      price: sellPrice,
      point_value: finalPV,
      quantity: 1,
    });
    toast.success(`${p.name} added to cart!`, { position: "bottom-right" });
  };

  const handleOrderNow = (p) => {
    const { sellPrice, finalPV } = getCalculatedPrice(p);
    addToCart({
      ...p,
      price: sellPrice,
      point_value: finalPV,
      quantity: 1,
    });
    router.push("/checkout");
  };

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-[#FF620A]" size={40} />
      </div>
    );

  if (products.length === 0) return null;

  return (
    <section className="py-12 px-4 max-w-[1400px] mx-auto bg-white">
      <Toaster />

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                Featured Collection
              </h2>
              <Star className="text-[#FF620A] fill-[#FF620A]" size={20} />
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Handpicked premium items for you
            </p>
          </div>

          <Link
            href="/shop"
            className="group flex items-center gap-1 text-xs font-semibold text-[#007A55] hover:text-[#FF620A]"
          >
            VIEW ALL
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {products.map((p) => {
          const { sellPrice, originalPrice, discount } = getCalculatedPrice(p);
          const pointVal = Number(p.point_value || 0);

          return (
            <div key={p.id} className="group flex flex-col">
              {/* Product Image Box */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F3F4F6] mb-3 border border-transparent group-hover:border-[#FF620A]/40 transition-all shadow-sm">
                
                {/* Badge Logic */}
                {pointVal > 0 && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className={`text-white text-[10px] font-bold px-2 py-1 rounded shadow-md flex items-center gap-1 ${isActiveMember ? 'bg-[#007A55]' : 'bg-[#FF620A]'}`}>
                       {isActiveMember ? (
                         <>
                           <Zap size={10} fill="white" className="animate-pulse" />
                           ৳{discount} OFF
                         </>
                       ) : (
                         <>
                           <Star size={10} fill="white" />
                           +{pointVal} PV
                         </>
                       )}
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

                <button
                  onClick={() => handleAddToCart(p)}
                  className="absolute bottom-0 left-0 right-0 bg-slate-900/90 text-white py-3 font-bold text-[11px] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex items-center justify-center gap-2 hover:bg-black"
                >
                  <ShoppingCart size={14} /> Add to Cart
                </button>

                <button
                  onClick={() => handleAddToCart(p)}
                  className="md:hidden absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md active:scale-90 z-10 border border-slate-200"
                >
                  <ShoppingCart size={14} className="text-[#FF620A]" />
                </button>
              </div>

              {/* Product Info */}
              <div className="flex flex-col text-left space-y-1 px-1">
                <Link href={`/shop/${p.id}`}>
                  <h3 className="text-[14px] font-semibold text-slate-800 line-clamp-1 hover:text-[#FF620A] transition-colors">
                    {p.name}
                  </h3>
                </Link>

                <div className="flex items-center flex-wrap gap-x-2">
                  <span className="text-[#007A55] font-bold text-sm">
                    Tk {Math.floor(sellPrice).toLocaleString()}
                  </span>
                  {isActiveMember && originalPrice && (
                    <span className="text-slate-400 text-[11px] line-through">
                      Tk {Math.floor(originalPrice).toLocaleString()}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleOrderNow(p)}
                  className="w-full mt-2 bg-[#FF620A] text-white py-2.5 rounded-lg font-bold text-[12px] flex items-center justify-center gap-1.5 hover:bg-[#e65a08] active:scale-95 transition-all shadow-sm"
                >
                  <Zap size={13} fill="white" /> Order Now
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
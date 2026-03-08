"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Package,
  Loader2,
  ChevronRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import { getProductById, getAllProducts } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();

  const { addToCart, cart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // ১. মেম্বারশিপ এবং ডিসকাউন্ট লজিক (PV * 2)
  const isActiveMember = user?.status === "active";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getProductById(id);
        setProduct(res.data);

        const all = await getAllProducts();
        const related = all.data
          .filter(
            (p) => p.category === res.data.category && p.id !== res.data.id,
          )
          .slice(0, 4);

        setRelatedProducts(related);
      } catch {
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#FF620A] mb-4" size={40} />
        <p className="text-slate-500 font-medium">পণ্য লোড হচ্ছে...</p>
      </div>
    );

  if (!product)
    return (
      <div className="text-center py-20 text-xl font-bold">
        Product not found
      </div>
    );

  // ২. প্রাইস এবং পিভি ক্যালকুলেশন (শপ পেজের লজিক অনুযায়ী)
  const originalPrice = Number(product.price || 0);
  const pointValue = Number(product.point_value || 0);
  const discountAmount = pointValue * 2;

  const finalPrice = isActiveMember
    ? Math.max(0, originalPrice - discountAmount)
    : originalPrice;

  const outOfStock = Number(product.stock || 0) <= 0;
  const existingItem = cart.find((item) => item.id === product.id);
  const existingQty = existingItem ? existingItem.quantity : 0;

  const handleAddToCart = () => {
    if (outOfStock) return;
    addToCart(product, quantity);
    toast.success("কার্টে যোগ করা হয়েছে");
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    addToCart(product, quantity);
    router.push("/cart");
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      <Toaster />

      {/* BREADCRUMB */}
      <div className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <Link href="/shop" className="hover:text-[#FF620A] transition-colors">
            Shop
          </Link>
          <ChevronRight size={14} />
          <span className="text-slate-900 line-clamp-1">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* LEFT: IMAGE SECTION */}
          <div className="relative group">
            <div className="aspect-square bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 p-6 md:p-12">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            {/* Badges */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              {outOfStock ? (
                <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                  Sold Out
                </span>
              ) : isActiveMember && discountAmount > 0 ? (
                <span className="bg-[#FF620A] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl shadow-orange-100">
                  ৳{discountAmount} Instant Discount
                </span>
              ) : pointValue > 0 ? (
                <span className="bg-[#FF620A] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl shadow-orange-100">
                  +{pointValue} Points Value
                </span>
              ) : null}
            </div>
          </div>

          {/* RIGHT: CONTENT SECTION */}
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                <Package size={14} />{" "}
                {product.category_name || "Premium Product"}
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* PRICE SECTION */}
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 inline-block min-w-[280px]">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-[#007A55]">
                  ৳{Math.floor(finalPrice).toLocaleString()}
                </span>
                {isActiveMember && discountAmount > 0 && (
                  <span className="text-lg text-slate-400 line-through font-bold">
                    ৳{Math.floor(originalPrice).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-tighter">
                Inclusive of all taxes
              </p>
            </div>

            {/* QUANTITY & ACTIONS */}
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">
                  Select Quantity
                </p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-colors text-xl font-bold"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-black text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.stock || 99, quantity + 1))
                      }
                      className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-colors text-xl font-bold"
                    >
                      +
                    </button>
                  </div>
                  {existingQty > 0 && (
                    <span className="text-xs font-bold text-blue-500 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                      In Cart: {existingQty}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#FF620A] transition-all disabled:bg-slate-200 shadow-xl shadow-slate-100"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={outOfStock}
                  className="flex-1 bg-[#FF620A] text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-900 transition-all disabled:bg-slate-200 shadow-xl shadow-orange-100"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* TRUST BADGES */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                  <Truck size={20} />
                </div>
                <span className="text-[11px] font-black text-slate-600 uppercase leading-tight">
                  Fast
                  <br />
                  Shipping
                </span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-[11px] font-black text-slate-600 uppercase leading-tight">
                  100%
                  <br />
                  Authentic
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* DESCRIPTION SECTION */}
        <div className="mt-20 lg:mt-32 max-w-4xl">
          <div className="inline-block border-b-4 border-[#FF620A] pb-2 mb-8">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Product Description
            </h2>
          </div>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">
              {product.description}
            </p>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 lg:mt-32">
            <h2 className="text-2xl font-black text-slate-900 mb-10 uppercase tracking-tight">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => {
                const pPrice = Number(p.price || 0);
                const pDisc = Number(p.point_value || 0) * 2;
                const pFinal = isActiveMember
                  ? Math.max(0, pPrice - pDisc)
                  : pPrice;

                return (
                  <Link
                    key={p.id}
                    href={`/shop/${p.id}`}
                    className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="aspect-[4/5] bg-slate-50 overflow-hidden p-4">
                      <img
                        src={p.image}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-700"
                        alt={p.name}
                      />
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-slate-800 text-sm line-clamp-2 mb-2 group-hover:text-[#FF620A] transition-colors h-10">
                        {p.name}
                      </h4>
                      <p className="font-black text-[#007A55] text-lg">
                        ৳{Math.floor(pFinal).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById, getAllProducts } from "@/services/productService";
import {
  ShoppingCart,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Info,
  RefreshCw,
  Gift,
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const isActiveMember = user?.status === "active";

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const res = await getProductById(id);
        setProduct(res.data);

        const allRes = await getAllProducts();
        const related = allRes.data
          .filter(
            (p) => p.category === res.data.category && p.id !== res.data.id,
          )
          .slice(0, 4);
        setRelatedProducts(related);
      } catch (err) {
        console.error("Error fetching product:", err);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProductData();
  }, [id]);

  const calculatePricing = () => {
    const originalPrice = Number(product?.price || 0);
    const pointValue = Number(product?.point_value || 0);

    if (isActiveMember) {
      return {
        finalPrice: originalPrice - pointValue,
        finalPV: 0,
        hasDiscount: pointValue > 0,
      };
    }
    return {
      finalPrice: originalPrice,
      finalPV: pointValue,
      hasDiscount: false,
    };
  };

  const { finalPrice, finalPV, hasDiscount } = calculatePricing();

  const handleAddToCart = () => {
    addToCart({
      ...product,
      quantity,
      price: finalPrice,
      point_value: finalPV,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/cart");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!product)
    return (
      <div className="text-center py-20 font-bold">Product not found!</div>
    );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 font-bold group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />{" "}
          Back to Shop
        </Link>

        {/* Top Section: Image and Info Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Image Column */}
          <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-white border-2 border-slate-100 dark:border-slate-800 shadow-xl">
            <img
              src={product.image}
              className="w-full h-full object-contain p-8"
              alt={product.name}
            />
          </div>

          {/* Right Column: Info & Actions */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                {product.category_name}
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                {product.name}
              </h1>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-blue-500/20">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-widest">
                    {hasDiscount ? "Member Price" : "Regular Price"}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-black text-blue-600">
                      ৳{Math.floor(finalPrice)}
                    </p>
                    {hasDiscount && (
                      <p className="text-lg text-slate-400 line-through font-bold">
                        ৳{Math.floor(product.price)}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className={`flex-1 p-6 rounded-3xl border-2 relative overflow-hidden transition-all duration-500 ${isActiveMember ? "bg-emerald-50 border-emerald-500" : "bg-slate-50 border-slate-200"}`}
                >
                  {isActiveMember && (
                    <div className="absolute top-2 right-2 animate-bounce text-emerald-600">
                      <Gift size={20} />
                    </div>
                  )}
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-widest">
                    {isActiveMember ? "Member Benefit" : "Reward Points"}
                  </p>
                  <p
                    className={`text-4xl font-black ${isActiveMember ? "text-emerald-600" : "text-slate-700"}`}
                  >
                    {isActiveMember
                      ? `৳${product.point_value} OFF`
                      : `${finalPV} PV`}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 py-6 border-y border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-sm tracking-widest">
                Quantity
              </span>
              <div className="flex items-center border-2 border-slate-200 rounded-2xl bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-6 py-3 hover:bg-slate-50 font-bold border-r"
                >
                  -
                </button>
                <span className="px-8 font-black text-xl">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-6 py-3 hover:bg-slate-50 font-bold border-l"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-4 bg-white rounded-2xl border border-slate-100 text-center">
                <ShieldCheck size={24} className="text-emerald-500 mb-2" />
                <span className="text-[10px] font-bold uppercase text-slate-500">
                  Original
                </span>
              </div>
              <div className="flex flex-col items-center p-4 bg-white rounded-2xl border border-slate-100 text-center">
                <Truck size={24} className="text-blue-500 mb-2" />
                <span className="text-[10px] font-bold uppercase text-slate-500">
                  Fast Delivery
                </span>
              </div>
              <div className="flex flex-col items-center p-4 bg-white rounded-2xl border border-slate-100 text-center">
                <RefreshCw size={24} className="text-purple-500 mb-2" />
                <span className="text-[10px] font-bold uppercase text-slate-500">
                  Easy Return
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-[1.5] py-5 rounded-[1.5rem] font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 ${product.stock > 0 ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
              >
                <ShoppingCart />{" "}
                {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className={`flex-1 py-5 rounded-[1.5rem] font-black text-xl transition-all active:scale-95 ${product.stock > 0 ? "bg-slate-900 hover:bg-black text-white" : "bg-slate-100 text-slate-300 cursor-not-allowed"}`}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Full Width Description Section (Now outside the grid) */}
        <div className="w-full bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
          <h3 className="text-2xl font-black flex items-center gap-3">
            <Info className="text-blue-600" size={28} /> Product Details
          </h3>
          <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 space-y-10">
            <h2 className="text-3xl font-black">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <Link
                  href={`/shop/${p.id}`}
                  key={p.id}
                  className="group bg-white p-4 rounded-[2rem] border border-slate-100 hover:shadow-2xl transition-all"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-50">
                    <img
                      src={p.image}
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                      alt={p.name}
                    />
                  </div>
                  <h3 className="font-bold text-slate-800 line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="text-blue-600 font-black mt-1">৳{p.price}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

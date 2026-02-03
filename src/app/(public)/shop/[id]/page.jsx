"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProductById } from "@/services/productService"; // Ai function ti service file a add korte hobe
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getProductById(id).then((res) => {
        setProduct(res.data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!product) return <div>Product not found!</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <Link
        href="/shop"
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 font-bold"
      >
        <ArrowLeft size={20} /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Section */}
        <div className="rounded-[3rem] overflow-hidden bg-white border dark:border-slate-800 shadow-xl">
          <img
            src={product.image}
            className="w-full h-full object-cover"
            alt={product.name}
          />
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          <span className="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase">
            {product.category_name}
          </span>
          <h1 className="text-4xl md:text-5xl font-black">{product.name}</h1>

          <div className="flex items-center gap-4">
            <p className="text-4xl font-black text-blue-600">
              ${product.price}
            </p>
            <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg font-bold">
              {product.point_value} PV Points
            </div>
          </div>

          <p className="text-slate-500 leading-relaxed text-lg">
            {product.description}
          </p>

          <div className="flex flex-col gap-4 py-6 border-y dark:border-slate-800">
            <div className="flex items-center gap-3 text-slate-600">
              <ShieldCheck className="text-emerald-500" />{" "}
              <span>Original Product Guarantee</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Truck className="text-blue-500" />{" "}
              <span>Fast Delivery in Bangladesh</span>
            </div>
          </div>

          <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-blue-500/40 transition-all flex items-center justify-center gap-3">
            <ShoppingCart /> Buy This Product
          </button>
        </div>
      </div>
    </div>
  );
}

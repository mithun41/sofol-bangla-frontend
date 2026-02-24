"use client";
import React from "react";
import { useCart } from "@/context/CartContext";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, loading } = useCart();

  // ১. শুধুমাত্র সাবটোটাল ক্যালকুলেশন
  const subtotal = cart.reduce(
    (acc, item) => acc + Number(item.price || 0) * item.quantity,
    0,
  );

  // ২. লোডিং স্টেট
  if (loading && cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
        <p className="text-slate-600 font-bold animate-pulse">
          Syncing your cart...
        </p>
      </div>
    );
  }

  // ৩. কার্ট খালি থাকলে ভিউ
  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-slate-50 p-8 rounded-full mb-6">
          <ShoppingBag size={80} className="text-slate-200" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          Your cart is empty!
        </h2>
        <p className="text-slate-500 mt-2 text-center">
          Looks like you haven't added anything yet.
        </p>
        <Link
          href="/shop"
          className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-black text-slate-900">Shopping Cart</h1>
          {loading && (
            <Loader2 className="animate-spin text-emerald-500" size={20} />
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Table Header (Desktop) */}
              <div className="hidden md:grid grid-cols-12 p-6 bg-slate-50/50 border-b text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="col-span-6">Product Details</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-3 text-right">Subtotal</div>
              </div>

              <div className="divide-y divide-slate-50">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 grid grid-cols-1 md:grid-cols-12 items-center gap-4"
                  >
                    {/* Product Info */}
                    <div className="col-span-6 flex items-center gap-4">
                      <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-emerald-600 font-bold mt-1">
                          PV: {item.point_value || 0}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          ৳{Number(item.price).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="col-span-3 flex justify-center">
                      <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.cartItemId, -1)
                          }
                          className="p-1.5 hover:bg-white rounded-lg"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-4 font-black text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.cartItemId, 1)
                          }
                          className="p-1.5 hover:bg-white rounded-lg"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal & Delete */}
                    <div className="col-span-3 text-right flex items-center justify-end gap-4">
                      <span className="font-black text-slate-900 text-lg">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.id, item.cartItemId)} // cartItemId যোগ করলি
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-6">
              <h2 className="text-xl font-black text-slate-800 mb-6">
                Summary
              </h2>

              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold text-slate-500">
                  Subtotal
                </span>
                <span className="text-3xl font-black text-slate-900">
                  ৳{subtotal.toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-6 bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
                * Shipping and taxes will be calculated at checkout based on
                your delivery address.
              </p>

              <Link
                href="/checkout"
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-center flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
              >
                Go to Checkout <ArrowRight size={20} />
              </Link>

              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Price Securely Synced with Store
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

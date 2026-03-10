"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  ChevronLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ShieldCheck,
  Truck,
  ArrowRight,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();

  const isActiveMember = user?.status === "active";

  const subtotal = cart.reduce((acc, item) => {
    const basePrice = Number(item.price || 0);
    const pv = Number(item.point_value || 0);

    const effectivePrice = isActiveMember
      ? Math.max(0, basePrice - pv * 2)
      : basePrice;

    return acc + effectivePrice * item.quantity;
  }, 0);

  const totalPV = cart.reduce((acc, item) => {
    const displayPV = isActiveMember ? 0 : Number(item.point_value || 0);
    return acc + displayPV * item.quantity;
  }, 0);

  const shippingNote =
    subtotal > 0 ? "Shipping will be calculated at checkout." : "";

  if (!cart.length) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="max-w-4xl mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-[#FF620A]/10 text-[#FF620A] flex items-center justify-center mb-6">
            <ShoppingBag size={34} />
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-3">
            Your cart is empty
          </h1>

          <p className="text-slate-500 max-w-md mb-8">
            Looks like you have not added anything yet. Explore our shop and
            find the products you love.
          </p>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-[#FF620A] hover:bg-[#e55a00] text-white px-7 py-3 rounded-xl font-bold transition"
          >
            Continue Shopping
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-slate-500 hover:text-[#FF620A] mb-3 font-medium transition"
          >
            <ChevronLeft size={18} />
            Continue Shopping
          </Link>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900">
            My Cart
          </h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">
            Review your selected items before proceeding to checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-7 space-y-4">
            {cart.map((item) => {
              const basePrice = Number(item.price || 0);
              const pv = Number(item.point_value || 0);

              const effectivePrice = isActiveMember
                ? Math.max(0, basePrice - pv * 2)
                : basePrice;

              return (
                <div
                  key={item.cartItemId || item.id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-5"
                >
                  <div className="flex gap-4">
                    <Link
                      href={`/shop/${item.id}`}
                      className="shrink-0 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 md:w-28 md:h-28 object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link href={`/shop/${item.id}`}>
                            <h3 className="text-sm md:text-base font-bold text-slate-800 line-clamp-2 hover:text-[#FF620A] transition">
                              {item.name}
                            </h3>
                          </Link>

                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-black text-[#FF620A]">
                              ৳{effectivePrice}
                            </span>

                            {isActiveMember && pv > 0 && (
                              <span className="text-xs text-slate-400 line-through">
                                ৳{basePrice}
                              </span>
                            )}

                            {!isActiveMember && pv > 0 && (
                              <span className="text-[11px] font-bold text-[#007A55] bg-[#007A55]/10 px-2 py-1 rounded-lg">
                                +{pv} PV
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            removeFromCart(item.id, item.cartItemId)
                          }
                          className="w-10 h-10 shrink-0 rounded-xl border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 flex items-center justify-center transition"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 mb-2">
                            Quantity
                          </p>

                          <div className="inline-flex items-center rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.cartItemId, -1)
                              }
                              className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 transition"
                            >
                              <Minus size={16} />
                            </button>

                            <span className="w-12 text-center font-bold text-slate-800">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.cartItemId, 1)
                              }
                              className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 transition"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-xs font-medium text-slate-500 mb-1">
                            Item Total
                          </p>
                          <p className="text-lg font-black text-slate-900">
                            ৳{effectivePrice * item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={clearCart}
                className="px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition"
              >
                Clear Cart
              </button>

              <Link
                href="/shop"
                className="px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:border-[#FF620A]/30 hover:text-[#FF620A] transition text-center"
              >
                Add More Products
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100 sticky top-24">
              <h3 className="text-xl font-black mb-6 text-slate-900">
                Cart Summary
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-sm font-medium">Items</span>
                  <span className="font-bold text-slate-800">
                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-sm font-medium">Total Points (PV)</span>
                  <span className="text-[#007A55] font-bold bg-[#007A55]/10 px-2.5 py-1 rounded-lg text-sm">
                    {totalPV}
                  </span>
                </div>

                {isActiveMember && (
                  <div className="bg-[#FF620A]/5 p-3 rounded-xl border border-[#FF620A]/15">
                    <p className="text-[11px] text-slate-700 font-semibold leading-tight">
                      As an active member, you are receiving a cash discount.
                      That is why no PV will be added for this order.
                    </p>
                  </div>
                )}

                <div className="flex items-start gap-2 text-slate-500 text-sm">
                  <Truck size={16} className="mt-0.5 text-[#007A55]" />
                  <span>{shippingNote}</span>
                </div>

                <div className="flex justify-between items-center pt-3 text-slate-900 border-t border-slate-100">
                  <span className="text-lg font-bold">Subtotal</span>
                  <span className="text-3xl font-black text-[#FF620A]">
                    ৳{subtotal}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full bg-[#FF620A] text-white py-4 rounded-2xl font-black text-base hover:bg-[#e55a00] transition-all flex items-center justify-center gap-3"
                >
                  Proceed to Checkout
                  <ShieldCheck size={20} />
                </button>

                <p className="text-xs text-slate-400 text-center leading-relaxed">
                  By proceeding, you will review shipping and payment details on
                  the checkout page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

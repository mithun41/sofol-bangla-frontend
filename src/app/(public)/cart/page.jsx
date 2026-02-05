"use client";
import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, Truck } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } =
    useCart();
  const [shippingMethod, setShippingMethod] = useState("inside");

  // Calculations using backend-verified prices
  const subtotal = cart.reduce(
    (acc, item) => acc + Number(item.price || 0) * item.quantity,
    0,
  );
  const shippingCost = shippingMethod === "inside" ? 100 : 130;
  const total = subtotal + shippingCost;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold">
        Loading Cart Prices...
      </div>
    );

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-400">
          Your cart is empty!
        </h2>
        <Link
          href="/shop"
          className="mt-4 text-emerald-500 font-semibold underline"
        >
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-10 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            {/* Table Header */}
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold">My Cart ({cart.length})</h2>
              <div className="hidden md:flex gap-16 text-xs font-bold text-slate-400 uppercase">
                <span>Quantity</span>
                <span>Price</span>
                <span>Subtotal</span>
              </div>
            </div>

            {/* Cart Items */}
            <div className="divide-y divide-slate-100">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-6 flex flex-col md:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 w-full md:w-1/3">
                    <img
                      src={item.image}
                      alt=""
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                    <h3 className="font-semibold text-slate-700">
                      {item.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto md:gap-10">
                    <div className="flex items-center border border-slate-300 rounded-md">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-2"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-4 font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-2"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="font-bold text-slate-700">
                      ৳{item.price}
                    </div>
                    <div className="font-bold text-emerald-600">
                      ৳{item.price * item.quantity}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Selection */}
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Truck size={20} className="text-emerald-500" /> Select Shipping
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setShippingMethod("inside")}
                className={`p-4 border-2 rounded-xl cursor-pointer ${shippingMethod === "inside" ? "border-emerald-500 bg-emerald-50" : "border-slate-100"}`}
              >
                <div className="flex justify-between font-bold">
                  <span>Inside Dhaka</span> <span>৳100</span>
                </div>
              </div>
              <div
                onClick={() => setShippingMethod("outside")}
                className={`p-4 border-2 rounded-xl cursor-pointer ${shippingMethod === "outside" ? "border-emerald-500 bg-emerald-50" : "border-slate-100"}`}
              >
                <div className="flex justify-between font-bold">
                  <span>Outside Dhaka</span> <span>৳130</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 sticky top-6">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            <div className="space-y-3 text-sm border-b pb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>{" "}
                <span className="font-bold">৳{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>{" "}
                <span className="font-bold">৳{shippingCost}</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-black text-emerald-600">
                ৳{total}
              </span>
            </div>
            <Link
              href="/checkout"
              className="w-full bg-[#009669] text-white py-4 rounded-lg font-bold text-center block shadow-lg"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

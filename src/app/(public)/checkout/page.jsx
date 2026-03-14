"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  MapPin,
  CreditCard,
  Loader2,
  CheckCircle2,
  ChevronLeft,
  Check,
} from "lucide-react";
import Link from "next/link";
import { orderService } from "@/services/order";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [orderLoading, setOrderLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Dhaka",
    courier: "Sundarban Courier",
    senderNumber: "",
    transactionId: "",
  });

  const isActiveMember = user?.status === "active";

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?redirect=/checkout");
      } else {
        setFormData((prev) => ({
          ...prev,
          name: user.name || "",
          phone: user.phone || "",
        }));
      }
    }
  }, [user, loading, router]);

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

  const shipping = formData.city === "Dhaka" ? 100 : 150;
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOrderLoading(true);

    const orderData = {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      courier: formData.courier,
      items: cart.map((i) => {
        const basePrice = Number(i.price || 0);
        const pv = Number(i.point_value || 0);
        const finalPrice = isActiveMember
          ? Math.max(0, basePrice - pv * 2)
          : basePrice;
        const finalPV = isActiveMember ? 0 : pv;

        return {
          product_id: i.id,
          quantity: i.quantity,
          price: finalPrice,
          point_value: finalPV,
        };
      }),
      subtotal: subtotal,
      shipping_cost: shipping,
      total_amount: total,
      payment_method: paymentMethod,
      sender_number: paymentMethod === "cod" ? "" : formData.senderNumber,
      transaction_id: paymentMethod === "cod" ? "" : formData.transactionId,
    };

    try {
      const res = await orderService.placeOrder(orderData);

      if (res && res.order_id) {
        clearCart();
        router.push(`/order-success?id=${res.order_id}`);
      } else {
        alert("Order processed but ID not found.");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        "Order failed! Please check your information.";
      alert(errorMessage);
      console.error("Order Error:", error);
    } finally {
      setOrderLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#FF620A] mb-4" size={48} />
        <p className="text-slate-600 font-bold">Checking access...</p>
      </div>
    );
  }

  if (!user) return null;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 px-4">
        <h2 className="text-2xl font-bold text-slate-800 text-center">
          Your cart is empty!
        </h2>
        <Link
          href="/shop"
          className="bg-[#FF620A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#e55a00] transition"
        >
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1 text-slate-500 hover:text-[#FF620A] mb-3 font-medium transition"
          >
            <ChevronLeft size={18} /> Back to Cart
          </Link>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900">
            Checkout
          </h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">
            Complete your order by providing shipping and payment details.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-[#FF620A]/10 rounded-xl text-[#FF620A]">
                  <MapPin size={22} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Shipping Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">
                    Full Name
                  </label>
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-[#FF620A] focus:border-transparent transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">
                    Phone Number
                  </label>
                  <input
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="017XXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-[#FF620A] focus:border-transparent transition"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-600">
                    District / City
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-[#FF620A] focus:border-transparent transition"
                  >
                    <option value="Dhaka">Inside Dhaka (৳100)</option>
                    <option value="Outside">Outside Dhaka (৳150)</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-600">
                    Select Courier Service
                  </label>
                  <select
                    name="courier"
                    value={formData.courier}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-[#FF620A] focus:border-transparent transition"
                  >
                    <option value="Sundarban Courier">
                      Sundarban Courier Service
                    </option>
                    <option value="SA Paribahan">SA Paribahan</option>
                    <option value="Steadfast Courier">Steadfast Courier</option>
                    <option value="Pathao Courier">Pathao Courier</option>
                    <option value="RedX">RedX Delivery</option>
                    <option value="Korotoa Courier">Korotoa Courier</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-600">
                    Full Address
                  </label>
                  <textarea
                    required
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-[#FF620A] focus:border-transparent transition resize-none"
                    placeholder="House/Road/Area details..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-[#007A55]/10 rounded-xl text-[#007A55]">
                  <CreditCard size={22} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Payment Method
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {["cod", "bkash", "nagad"].map((method) => (
                  <button
                    type="button"
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`relative p-4 border-2 rounded-2xl text-center transition-all ${
                      paymentMethod === method
                        ? "border-[#FF620A] bg-[#FF620A]/5 shadow-sm"
                        : "border-slate-200 hover:border-[#FF620A]/40"
                    }`}
                  >
                    <span className="text-sm font-black uppercase text-slate-800">
                      {method === "cod" ? "Cash on Delivery" : method}
                    </span>
                    {paymentMethod === method && (
                      <CheckCircle2
                        className="absolute top-2 right-2 text-[#FF620A]"
                        size={16}
                      />
                    )}
                  </button>
                ))}
              </div>

              {paymentMethod !== "cod" && (
                <div className="p-6 bg-slate-900 rounded-2xl text-white space-y-4">
                  <p className="text-sm text-slate-300">
                    Send Money to (Bkash):
                    <span className="font-bold text-[#FF620A] mx-1">
                      01631-072225
                    </span>
                    Or Nagad:
                    <span className="font-bold text-[#FF620A] mx-1">
                      01710-855197
                    </span>
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      required={paymentMethod !== "cod"}
                      name="senderNumber"
                      value={formData.senderNumber}
                      onChange={handleInputChange}
                      placeholder="Your BKash/Nagad Number"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 outline-none focus:ring-2 focus:ring-[#FF620A]"
                    />
                    <input
                      required={paymentMethod !== "cod"}
                      name="transactionId"
                      value={formData.transactionId}
                      onChange={handleInputChange}
                      placeholder="Transaction ID"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 outline-none focus:ring-2 focus:ring-[#FF620A]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100 sticky top-24">
              <h3 className="text-xl font-black mb-6 text-slate-900">
                Order Summary
              </h3>

              <div className="space-y-4 mb-6 max-h-[320px] overflow-y-auto pr-1">
                {cart.map((item) => {
                  const basePrice = Number(item.price || 0);
                  const pv = Number(item.point_value || 0);
                  const finalPrice = isActiveMember
                    ? Math.max(0, basePrice - pv * 2)
                    : basePrice;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 justify-between pb-4 border-b border-slate-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image}
                          className="h-14 w-14 rounded-xl object-cover border border-slate-200"
                          alt=""
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold line-clamp-1 text-slate-800">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Qty: {item.quantity} × ৳{finalPrice}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-slate-900">
                          ৳{finalPrice * item.quantity}
                        </p>
                        {isActiveMember && pv > 0 && (
                          <p className="text-[9px] text-[#FF620A] font-bold">
                            MEMBERSHIP APPLIED
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-6 mb-6">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-sm font-medium">Total Points (PV)</span>
                  <span className="text-[#007A55] font-bold bg-[#007A55]/10 px-2.5 py-1 rounded-lg text-sm">
                    {totalPV}
                  </span>
                </div>

                {isActiveMember && (
                  <div className="bg-[#FF620A]/5 p-3 rounded-xl border border-[#FF620A]/15 flex gap-2 items-start mb-2">
                    <Check
                      className="text-[#FF620A] mt-0.5"
                      size={14}
                      strokeWidth={3}
                    />
                    <p className="text-[11px] text-slate-700 font-semibold leading-tight">
                      As an active member, you are receiving a cash discount.
                      That is why no PV will be added for this order.
                    </p>
                  </div>
                )}

                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span>৳{subtotal}</span>
                </div>

                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Shipping</span>
                  <span>৳{shipping}</span>
                </div>

                <div className="flex justify-between items-center pt-3 text-slate-900 border-t border-slate-100">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-3xl font-black text-[#FF620A]">
                    ৳{total}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={orderLoading}
                className="w-full bg-[#FF620A] text-white py-4 md:py-5 rounded-2xl font-black text-base md:text-lg hover:bg-[#e55a00] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {orderLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Confirm Order <ShieldCheck size={22} />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

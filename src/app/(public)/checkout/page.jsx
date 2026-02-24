"use client";
import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  MapPin,
  Phone,
  CreditCard,
  Loader2,
  CheckCircle2,
  ChevronLeft,
  Truck,
} from "lucide-react";
import Link from "next/link";

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
    senderNumber: "",
    transactionId: "",
  });

  // ১. ইউজার অথেনটিকেশন চেক
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?redirect=/checkout");
      } else {
        setFormData((prev) => ({
          ...prev,
          name: user.name || "",
          phone: user.phone || "", // যদি প্রোফাইলে ফোন থাকে
        }));
      }
    }
  }, [user, loading, router]);

  // ২. ক্যালকুলেশন
  const subtotal = cart.reduce(
    (acc, item) => acc + Number(item.price || 0) * item.quantity,
    0,
  );
  const shipping = formData.city === "Dhaka" ? 100 : 150;
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ৩. অর্ডার সাবমিট লজিক
  const handleSubmit = async (e) => {
    e.preventDefault();
    setOrderLoading(true);

    const orderData = {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      items: cart.map((i) => ({
        product_id: i.id,
        quantity: i.quantity,
        price: i.price,
        point_value: i.point_value || 0,
      })),
      subtotal: subtotal,
      shipping_cost: shipping,
      total_amount: total,
      payment_method: paymentMethod,
      sender_number: paymentMethod === "cod" ? "" : formData.senderNumber,
      transaction_id: paymentMethod === "cod" ? "" : formData.transactionId,
    };

    try {
      const response = await fetch(
        "https://mithun41.pythonanywhere.com/api/orders/place-order/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
          body: JSON.stringify(orderData),
        },
      );

      const res = await response.json();

      if (response.ok) {
        clearCart();
        router.push(`/order-success?id=${res.order_id}`);
      } else {
        alert(res.error || "Order failed! Please check your information.");
      }
    } catch (error) {
      alert(
        "Server connection error! Please check if your backend is running.",
      );
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-slate-600 font-bold">Checking access...</p>
      </div>
    );
  }

  if (!user) return null;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">
          Your cart is empty!
        </h2>
        <Link
          href="/shop"
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold"
        >
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/cart"
            className="flex items-center gap-1 text-slate-500 hover:text-blue-600 mb-2 font-medium"
          >
            <ChevronLeft size={18} /> Back to Cart
          </Link>
          <h1 className="text-3xl font-black text-slate-900">Checkout</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Left Column: Forms */}
          <div className="lg:col-span-7 space-y-6">
            {/* Shipping Info */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <MapPin size={22} />
                </div>
                <h3 className="text-xl font-bold">Shipping Details</h3>
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
                    className="input-field w-full px-4 py-3 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="input-field w-full px-4 py-3 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-4 py-3 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Dhaka">Inside Dhaka (৳100)</option>
                    <option value="Outside">Outside Dhaka (৳150)</option>
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
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl border bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="House/Road/Area details..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <CreditCard size={22} />
                </div>
                <h3 className="text-xl font-bold">Payment Method</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {["cod", "bkash", "nagad"].map((method) => (
                  <button
                    type="button"
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`relative p-4 border-2 rounded-2xl text-center transition-all ${paymentMethod === method ? "border-blue-500 bg-blue-50" : "border-slate-100"}`}
                  >
                    <span className="text-sm font-black uppercase">
                      {method === "cod" ? "Cash on Delivery" : method}
                    </span>
                    {paymentMethod === method && (
                      <CheckCircle2
                        className="absolute top-2 right-2 text-blue-500"
                        size={16}
                      />
                    )}
                  </button>
                ))}
              </div>

              {paymentMethod !== "cod" && (
                <div className="p-6 bg-slate-900 rounded-2xl text-white space-y-4 animate-in fade-in slide-in-from-top-2">
                  <p className="text-sm opacity-80">
                    Send Money to (Personal):{" "}
                    <span className="font-bold text-blue-400">
                      01700-000000
                    </span>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      required={paymentMethod !== "cod"}
                      name="senderNumber"
                      value={formData.senderNumber}
                      onChange={handleInputChange}
                      placeholder="Your BKash/Nagad Number"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 outline-none"
                    />
                    <input
                      required={paymentMethod !== "cod"}
                      name="transactionId"
                      value={formData.transactionId}
                      onChange={handleInputChange}
                      placeholder="Transaction ID (TrxID)"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-24">
              <h3 className="text-lg font-black mb-6">Order Summary</h3>
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        className="h-12 w-12 rounded-lg object-cover border"
                        alt=""
                      />
                      <div>
                        <p className="text-sm font-bold line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-black">
                      ৳{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t pt-6 mb-6">
                <div className="flex justify-between text-slate-500 italic">
                  <span>Total Points (PV)</span>
                  <span className="text-emerald-600 font-bold">
                    {cart.reduce(
                      (acc, i) => acc + i.point_value * i.quantity,
                      0,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span>৳{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Shipping</span>
                  <span>৳{shipping}</span>
                </div>
                <div className="flex justify-between items-center pt-2 text-slate-900 border-t">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-3xl font-black text-blue-600">
                    ৳{total}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={orderLoading}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-lg shadow-blue-200"
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

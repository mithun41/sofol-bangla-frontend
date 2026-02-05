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

  // লগইন না থাকলে রিডাইরেক্ট লজিক
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?redirect=/checkout");
      } else {
        setFormData((prev) => ({ ...prev, name: user.name || "" }));
      }
    }
  }, [user, loading, router]);

  const subtotal = cart.reduce(
    (acc, item) => acc + Number(item.price || 0) * item.quantity,
    0,
  );
  const shipping = formData.city === "Dhaka" ? 100 : 130;
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOrderLoading(true);

    // ব্যাকএন্ড এরর অনুযায়ী ডাটাকে সাজানো হয়েছে
    const orderData = {
      // রুট লেভেলে ডাটা পাঠাতে হবে (customer অবজেক্টের ভেতর নয়)
      name: formData.name,
      phone: formData.phone, // এখানে 'phone' কি-ই ব্যবহার করা হয়েছে
      address: formData.address,
      city: formData.city,

      // কার্ট আইটেম
      items: cart.map((i) => ({
        product_id: i.id, // 'id' নয়, 'product_id' পাঠান
        product_name: i.name,
        quantity: i.quantity,
        price: i.price,
        point_value: i.point_value || 0,
      })),

      subtotal: subtotal, // এটি এখন রুট লেভেলে, যা এরর ফিক্স করবে
      shipping_cost: shipping,
      total_amount: total,

      payment_method: paymentMethod,
      sender_number: formData.senderNumber,
      transaction_id: formData.transactionId,
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/orders/place-order/",
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
        // যদি আরও কোনো ভ্যালিডেশন এরর থাকে তা কনসোলে দেখাবে
        console.error("Backend Validation Error:", res);
        alert("Please check your information and try again.");
      }
    } catch (error) {
      alert("Server connection error!");
    } finally {
      setOrderLoading(false);
    }
  };

  // রিফ্রেশ করার সময় লোডিং স্ক্রিন
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-slate-600 font-bold animate-pulse">
          Checking your access...
        </p>
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
          className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold"
        >
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition mb-2 font-medium"
          >
            <ChevronLeft size={18} /> Back to Cart
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-7 space-y-6">
            <form
              id="checkout-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Shipping Box */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <MapPin size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">
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
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">
                      Phone Number
                    </label>
                    <input
                      required
                      name="phone"
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50"
                      placeholder="017XXXXXXXX"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-slate-600">
                      Full Delivery Address
                    </label>
                    <textarea
                      required
                      name="address"
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50"
                      placeholder="House no, Street name, Area..."
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Payment Box */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <CreditCard size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Payment Method
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {["cod", "bkash", "nagad"].map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`relative p-4 border-2 rounded-2xl text-center transition-all ${paymentMethod === method ? "border-blue-500 bg-blue-50" : "border-slate-100 hover:border-slate-200"}`}
                    >
                      <span className="text-sm font-black uppercase text-slate-700">
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
                  <div className="p-6 bg-slate-900 rounded-2xl text-white space-y-4 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium opacity-80">
                        Send Money to (Personal):
                      </p>
                      <span className="bg-blue-600 px-3 py-1 rounded-lg text-xs font-bold uppercase">
                        {paymentMethod}
                      </span>
                    </div>
                    <p className="text-2xl font-black tracking-widest text-blue-400">
                      01700-000000
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <input
                        required
                        name="senderNumber"
                        onChange={handleInputChange}
                        placeholder="Your Number"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 outline-none focus:border-blue-400 text-sm"
                      />
                      <input
                        required
                        name="transactionId"
                        onChange={handleInputChange}
                        placeholder="TrxID"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 outline-none focus:border-blue-400 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-24">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center justify-between">
                Order Review{" "}
                <span className="text-sm font-medium text-slate-400">
                  {cart.length} items
                </span>
              </h3>

              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 flex-shrink-0">
                        <img
                          src={item.image}
                          className="h-full w-full rounded-xl object-cover border border-slate-100"
                        />
                        <span className="absolute -top-2 -right-2 bg-slate-800 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                          {item.quantity}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-700 line-clamp-1">
                        {item.name}
                      </p>
                    </div>
                    <p className="text-sm font-black text-slate-900 whitespace-nowrap">
                      ৳{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-6 mb-6">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span>৳{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Truck size={16} /> Shipping
                  </span>
                  <span>৳{shipping}</span>
                </div>
                <div className="flex justify-between items-center pt-2 text-slate-900">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-3xl font-black text-blue-600 tracking-tight">
                    ৳{total}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
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

              <p className="mt-4 text-center text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                🔒 Secure SSL Encrypted Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

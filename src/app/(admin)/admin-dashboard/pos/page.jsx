"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";
import api from "@/services/api";
import {
  Search,
  User,
  ScanLine,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  XCircle,
} from "lucide-react";

// কারেন্সি ফরম্যাটার
const formatBDT = (value) => {
  const n = Number(value || 0);
  return `৳${n.toFixed(2).replace(/\.00$/, "")}`;
};

export default function POSPage() {
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart } =
    useCart();

  const [barcode, setBarcode] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [customerSearch, setCustomerSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const barcodeRef = useRef(null);
  const beepRef = useRef(null);

  // --- ১. ডাইনামিক প্রাইস ক্যালকুলেটর (১ পয়েন্ট = ২ টাকা ডিসকাউন্ট) ---
  const getEffectivePrice = (item) => {
    const basePrice = parseFloat(item.price || 0);
    const pv = parseFloat(item.point_value || 0);
    const isMemberActive = selectedCustomer?.status?.toLowerCase() === "active";

    // ✅ লজিক: মেম্বার একটিভ হলে (Price - (PV * 2)), নাহলে ফুল MRP
    if (isMemberActive) {
      return basePrice - pv * 2;
    }
    return basePrice;
  };

  // --- ২. সাবটোটাল ক্যালকুলেশন (রিয়েল-টাইম) ---
  const dynamicSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      return acc + getEffectivePrice(item) * item.quantity;
    }, 0);
  }, [cart, selectedCustomer]);

  // --- ৩. সার্চ এবং স্ক্যান লজিক ---
  useEffect(() => {
    if (customerSearch.length < 2) {
      setCustomers([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(
          `pos/customers/search/?q=${encodeURIComponent(customerSearch)}`,
        );
        setCustomers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Customer Search Error", err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearch]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    setSearchLoading(true);
    setSearchOpen(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(
          `pos/products/search/?q=${encodeURIComponent(q)}`,
        );
        setSearchResults(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Product Search Error", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleScan = async (e) => {
    e.preventDefault();
    const code = barcode.trim();
    if (!code || scanLoading) return;
    setScanLoading(true);
    try {
      const res = await api.get(`products/get_by_barcode/?code=${code}`);
      addToCart(res.data);
      playBeep();
      setBarcode("");
    } catch (err) {
      toast.error("প্রোডাক্ট পাওয়া যায়নি!");
      setBarcode("");
    } finally {
      setScanLoading(false);
    }
  };

  // --- ৪. ফাইনাল চেকআউট ---
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("কার্টে কোনো প্রোডাক্ট নেই!");
      return;
    }
    if (!selectedCustomer) {
      toast.error("দয়া করে একজন কাস্টমার সিলেক্ট করুন!");
      return;
    }

    const confirmSale = window.confirm("আপনি কি এই বিক্রিটি সম্পন্ন করতে চান?");
    if (!confirmSale) return;

    const orderData = {
      customer_id: selectedCustomer.id,
      payment_method: "Cash",
      items: cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    };

    setIsSubmitting(true);
    try {
      await api.post("pos/order/create/", orderData);
      toast.success("বিক্রি সফল হয়েছে!");
      clearCart();
      setSelectedCustomer(null);
      setCustomerSearch("");
    } catch (err) {
      toast.error(
        err.response?.data?.error || "অর্ডার সম্পন্ন করতে সমস্যা হয়েছে!",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    beepRef.current = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3",
    );
    barcodeRef.current?.focus();
  }, []);

  const playBeep = () => beepRef.current?.play().catch(() => {});

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-8">
        {/* Left Side: Controls & Table */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Search */}
            <div className="relative bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2 ml-2">
                <User size={14} /> Customer Selection
              </label>
              {selectedCustomer ? (
                <div className="flex items-center justify-between bg-blue-50 p-3 rounded-2xl border border-blue-100">
                  <div>
                    <span className="font-bold text-blue-700">
                      {selectedCustomer.username}
                    </span>
                    <span
                      className={`ml-3 text-[10px] font-black px-2 py-1 rounded-lg ${
                        selectedCustomer.status === "active"
                          ? "bg-green-100 text-green-600"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {selectedCustomer.status?.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCustomer(null);
                      setCustomerSearch("");
                    }}
                    className="text-rose-500 hover:scale-110 transition"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Type name or phone number..."
                  className="w-full bg-transparent px-2 py-1 outline-none font-bold text-slate-700"
                />
              )}
              {customers.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white shadow-2xl rounded-2xl border border-slate-100 z-50 overflow-hidden">
                  {customers.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedCustomer(c);
                        setCustomers([]);
                      }}
                      className="p-4 hover:bg-slate-50 cursor-pointer border-b last:border-0"
                    >
                      <p className="font-bold text-sm">
                        {c.username}{" "}
                        <span className="text-[10px] opacity-50">
                          ({c.status})
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400 font-black">
                        {c.phone}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Search */}
            <div className="bg-slate-900 p-4 rounded-[2rem] flex items-center gap-4 shadow-lg shadow-slate-200">
              <div className="flex-1">
                <form onSubmit={handleScan} className="flex items-center gap-3">
                  <ScanLine className="text-blue-400" size={24} />
                  <input
                    ref={barcodeRef}
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Scan Barcode..."
                    className="bg-transparent text-white outline-none font-bold w-full"
                  />
                </form>
              </div>
              <div className="w-px h-8 bg-slate-700"></div>
              <div className="flex-1 relative">
                <div className="flex items-center gap-2">
                  <Search className="text-slate-500" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Product..."
                    className="bg-transparent text-white outline-none font-bold w-full"
                  />
                </div>
                {searchOpen && (
                  <div className="absolute left-[-50%] right-0 top-full mt-4 bg-white shadow-2xl rounded-2xl border border-slate-100 z-50 max-h-80 overflow-auto">
                    {searchLoading ? (
                      <div className="p-6 text-center animate-pulse font-bold text-slate-400">
                        Searching...
                      </div>
                    ) : (
                      searchResults.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            addToCart(p);
                            setSearchOpen(false);
                            setSearchQuery("");
                            playBeep();
                          }}
                          className="p-4 hover:bg-blue-50 cursor-pointer border-b flex justify-between items-center"
                        >
                          <div>
                            <p className="font-black text-slate-800 text-sm">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold">
                              STOCK: {p.stock}
                            </p>
                          </div>
                          <span className="font-black text-blue-600">
                            {formatBDT(p.price)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cart Table */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[500px]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black uppercase tracking-widest text-slate-400 text-xs flex items-center gap-2">
                <ShoppingCart size={16} /> Current Cart ({cart.length})
              </h3>
              <button
                onClick={clearCart}
                className="text-[10px] font-black text-rose-500 uppercase hover:bg-rose-50 px-4 py-2 rounded-full transition-all"
              >
                Clear Cart
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <table className="w-full">
                <thead className="bg-slate-50/50 sticky top-0 backdrop-blur-md">
                  <tr className="text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <th className="px-8 py-4">Product Details</th>
                    <th className="px-8 py-4 text-center">Qty</th>
                    <th className="px-8 py-4 text-right">Subtotal</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-32 text-center opacity-20">
                        <ScanLine size={64} className="mx-auto mb-4" />
                        <p className="font-black uppercase text-2xl tracking-tighter">
                          Ready for Transaction
                        </p>
                      </td>
                    </tr>
                  ) : (
                    cart.map((item) => {
                      const currentPrice = getEffectivePrice(item);
                      return (
                        <tr
                          key={item.cartItemId || item.id}
                          className="group hover:bg-slate-50/30 transition-colors"
                        >
                          <td className="px-8 py-5">
                            <p className="font-black text-slate-800 leading-tight">
                              {item.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                Unit: {formatBDT(currentPrice)}
                              </span>
                              {selectedCustomer?.status === "active" && (
                                <span className="text-[8px] bg-green-100 text-green-600 px-1 rounded font-black">
                                  MEMBER PRICE (-
                                  {parseFloat(item.point_value) * 2} TK OFF)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <div className="flex items-center justify-center gap-3 bg-slate-100 w-fit mx-auto p-1 rounded-xl">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.cartItemId, -1)
                                }
                                className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center hover:text-blue-600 transition-all"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="font-black text-sm w-4">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.cartItemId, 1)
                                }
                                className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center hover:text-blue-600 transition-all"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right font-black text-slate-900">
                            {formatBDT(currentPrice * item.quantity)}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button
                              onClick={() =>
                                removeFromCart(item.id, item.cartItemId)
                              }
                              className="p-2 text-slate-200 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden sticky top-8">
            <div className="p-8 bg-slate-900 text-white">
              <h2 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6">
                Transaction Summary
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center font-bold text-sm">
                  <span className="opacity-50">Customer</span>
                  <span className="text-blue-400">
                    {selectedCustomer ? selectedCustomer.username : "Guest"}
                  </span>
                </div>
                <div className="flex justify-between items-center font-bold text-sm">
                  <span className="opacity-50">Benefit</span>
                  <span
                    className={
                      selectedCustomer?.status === "active"
                        ? "text-green-400"
                        : "text-slate-400"
                    }
                  >
                    {selectedCustomer?.status === "active"
                      ? "2x PV Discount"
                      : "Points Collection"}
                  </span>
                </div>
              </div>
              <div className="mt-12">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">
                  Grand Total
                </p>
                <h1 className="text-6xl font-black tracking-tighter">
                  {formatBDT(dynamicSubtotal)}
                </h1>
              </div>
            </div>

            <div className="p-8 space-y-4">
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || isSubmitting}
                className="w-full bg-blue-600 text-white font-black py-6 rounded-3xl text-lg uppercase tracking-widest hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
              >
                {isSubmitting ? "Processing..." : "Finish Sale"}
              </button>
              <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                Tax and point calculations are processed automatically
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

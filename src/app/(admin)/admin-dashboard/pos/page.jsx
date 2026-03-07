"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";
import api from "@/services/api";
import CustomerSearch from "../../components/pos/CustomerSearch";
import ProductScanner from "../../components/pos/ProductScanner";
import CartTable from "../../components/pos/CartTable";
import OrderSummary from "../../components/pos/OrderSummary";
import QuickRegister from "../../components/pos/QuickRegister"; // কম্পোনেন্টটি ইম্পোর্ট কর

// কারেন্সি ফরম্যাটার
const formatBDT = (value) => {
  const n = Number(value || 0);
  return `৳${n.toFixed(2).replace(/\.00$/, "")}`;
};

export default function POSPage() {
  // ১. কার্ট কন্টেক্সট থেকে মেথডগুলো আনা
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart } =
    useCart();

  // ২. স্টেটস (States)
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

  // --- ৩. ডাইনামিক প্রাইস লজিক (১ পয়েন্ট = ২ টাকা ডিসকাউন্ট) ---
  const getEffectivePrice = (item) => {
    const basePrice = parseFloat(item.price || 0);
    const pv = parseFloat(item.point_value || 0);
    // যদি কাস্টমার সিলেক্ট থাকে এবং স্ট্যাটাস Active হয়
    const isMemberActive = selectedCustomer?.status?.toLowerCase() === "active";

    return isMemberActive ? basePrice - pv * 2 : basePrice;
  };

  // --- ৪. রিয়েল-টাইম সাবটোটাল ক্যালকুলেশন ---
  const dynamicSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      return acc + getEffectivePrice(item) * item.quantity;
    }, 0);
  }, [cart, selectedCustomer]);

  // --- ৫. কাস্টমার সার্চ লজিক (Debounced) ---
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

  // --- ৬. প্রোডাক্ট সার্চ লজিক (Debounced) ---
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

  // --- ৭. বারকোড স্ক্যান হ্যান্ডলার ---
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

  // --- ৮. রেজিস্ট্রেশন পরবর্তী অটো-সিলেক্ট লজিক ---
  const handleQuickRegisterSuccess = (newCustomer) => {
    // API থেকে আসা ইউজার অবজেক্ট সরাসরি সিলেক্ট করছি
    setSelectedCustomer(newCustomer);
    setCustomerSearch("");
    toast.success(`${newCustomer.username} এখন সিলেক্টেড!`);
  };

  // --- ৯. ফাইনাল চেকআউট (Order Creation) ---
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("কার্টে কোনো প্রোডাক্ট নেই!");
      return;
    }
    if (!selectedCustomer) {
      toast.error(
        "দয়া করে একজন কাস্টমার সিলেক্ট করুন অথবা নতুন রেজিস্টার করুন!",
      );
      return;
    }

    if (!window.confirm("আপনি কি এই বিক্রিটি সম্পন্ন করতে চান?")) return;

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

  // --- ১০. সাউন্ড এবং ফোকাস ইফেক্ট ---
  useEffect(() => {
    beepRef.current = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3",
    );
    barcodeRef.current?.focus();
  }, []);

  const playBeep = () => beepRef.current?.play().catch(() => {});

  // --- ১১. UI রেন্ডারিং ---
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-8">
        {/* বাম পাশ: কাস্টমার, স্ক্যানার এবং টেবিল */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomerSearch
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
              customerSearch={customerSearch}
              setCustomerSearch={setCustomerSearch}
              customers={customers}
            />

            <ProductScanner
              barcode={barcode}
              setBarcode={setBarcode}
              handleScan={handleScan}
              barcodeRef={barcodeRef}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchOpen={searchOpen}
              searchLoading={searchLoading}
              searchResults={searchResults}
              addToCart={addToCart}
              setSearchOpen={setSearchOpen}
              playBeep={playBeep}
              formatBDT={formatBDT}
            />
          </div>

          {/* ✅ Quick Register Section: কাস্টমার সিলেক্ট না থাকলে এটা দেখাবে */}
          {!selectedCustomer && (
            <QuickRegister onRegisterSuccess={handleQuickRegisterSuccess} />
          )}

          <CartTable
            cart={cart}
            getEffectivePrice={getEffectivePrice}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            formatBDT={formatBDT}
            selectedCustomer={selectedCustomer}
          />
        </div>

        {/* ডান পাশ: অর্ডার সামারি এবং পেমেন্ট */}
        <div className="col-span-12 lg:col-span-4">
          <OrderSummary
            selectedCustomer={selectedCustomer}
            dynamicSubtotal={dynamicSubtotal}
            handleCheckout={handleCheckout}
            isSubmitting={isSubmitting}
            formatBDT={formatBDT}
            cartLength={cart.length}
          />
        </div>
      </div>
    </div>
  );
}

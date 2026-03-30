"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { toast, Toaster } from "react-hot-toast";
import api from "@/services/api";
import { useReactToPrint } from "react-to-print";

import CustomerSearch from "../../components/pos/CustomerSearch";
import ProductScanner from "../../components/pos/ProductScanner";
import CartTable from "../../components/pos/CartTable";
import OrderSummary from "../../components/pos/OrderSummary";
import QuickRegister from "../../components/pos/QuickRegister";
import ThermalInvoice from "../../components/pos/ThermalInvoice";
import Swal from "sweetalert2";

// ─── Formatter ────────────────────────────────────────────────────────────────
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

  // Print state
  const [lastOrder, setLastOrder] = useState(null);
  const [printCart, setPrintCart] = useState([]);
  const invoiceRef = useRef();
  const barcodeRef = useRef(null);
  const beepRef = useRef(null);

  const handlePrint = useReactToPrint({ contentRef: invoiceRef });
// ── ফোকাস লজিক: রেজিস্ট্রেশন বা সার্চের সময় ডিস্টার্ব করবে না ──────────────────
useEffect(() => {
  const handleGlobalClick = (e) => {
    const active = document.activeElement;
    
    // ১. যদি বর্তমানে কোনো ইনপুট ফিল্ড অলরেডি ফোকাসড থাকে, তবে আমরা কিছুই করব না
    const isAlreadyTyping = 
      active.tagName === "INPUT" || 
      active.tagName === "TEXTAREA" || 
      active.tagName === "SELECT" ||
      active.isContentEditable;

    if (isAlreadyTyping) return; // টাইপ করা অবস্থায় ফোকাস কাড়বে না

    // ২. ক্লিক করা এলিমেন্টটি চেক করা
    const clickedElement = e.target;
    const isInteractive = 
      clickedElement.tagName === "INPUT" || 
      clickedElement.tagName === "TEXTAREA" || 
      clickedElement.tagName === "SELECT" ||
      clickedElement.closest('button') ||
      clickedElement.closest('.customer-dropdown') ||
      clickedElement.closest('.swal2-container'); // SweetAlert খোলা থাকলে ডিস্টার্ব করবে না

    // ৩. যদি একদম ফাঁকা জায়গায় ক্লিক হয়, শুধু তখনই স্ক্যানারে যাবে
    if (!isInteractive) {
      setTimeout(() => {
        // পুনরায় চেক করা যেন এর মধ্যে ইউজার অন্য কোথাও ক্লিক না করে ফেলে
        if (document.activeElement.tagName === 'BODY' || document.activeElement.tagName === 'DIV') {
          barcodeRef.current?.focus();
        }
      }, 50);
    }
  };

  // ৪. ফোকাস আউট হয়ে গেলে যেন হারিয়ে না যায় (স্মার্ট রিটার্ন)
  const handleBlurLogic = (e) => {
    // যদি ট্যাব বা অন্য কারণে ফোকাস চলে যায়, তবে ৩৫০ms পর স্ক্যানারে ফিরবে
    // কিন্তু যদি ইউজার অন্য কোনো ইনপুটে যায়, তবে ফিরবে না
    setTimeout(() => {
      const active = document.activeElement;
      if (!active || active.tagName === "BODY") {
        barcodeRef.current?.focus();
      }
    }, 350);
  };

  window.addEventListener("mouseup", handleGlobalClick);
  // ইনপুট ফিল্ডের ভেতরে টাইপিং এর সময় এই ইভেন্ট যেন ডিস্টার্ব না করে তাই 
  // focusout এর বদলে আমরা শুধু mouseup দিয়ে ফাঁকা জায়গা ট্র্যাক করছি
  
  return () => {
    window.removeEventListener("mouseup", handleGlobalClick);
  };
}, []);
  const getEffectivePrice = (item) => {
    const basePrice = parseFloat(item.price || 0);
    const pv = parseFloat(item.point_value || 0);
    const isMemberActive = selectedCustomer?.status?.toLowerCase() === "active";
    return isMemberActive ? basePrice - pv * 2 : basePrice;
  };

  const dynamicSubtotal = useMemo(() => {
    return cart.reduce(
      (acc, item) => acc + getEffectivePrice(item) * item.quantity,
      0,
    );
  }, [cart, selectedCustomer]);

  // ── Customer search ───────────────────────────────────────────────────────
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
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearch]);

  // ── Product search ────────────────────────────────────────────────────────
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
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Barcode scan handler ──────────────────────────────────────────────────
  const handleScan = async (e) => {
    e.preventDefault();
    const code = barcode.trim();
    if (!code || scanLoading) return;

    setScanLoading(true);
    try {
      const res = await api.get(`pos/products/search/?q=${code}`);
      const product = Array.isArray(res.data) ? res.data[0] : res.data;

      if (product) {
        addToCart(product);
        playBeep();
        setBarcode("");
        toast.success(`${product.name} added!`, {
          duration: 1000,
          position: "bottom-center",
        });
      } else {
        toast.error("Product not found!");
        setBarcode("");
      }
    } catch (err) {
      toast.error("Scan failed!");
      setBarcode("");
    } finally {
      setScanLoading(false);
      setTimeout(() => {
        barcodeRef.current?.focus();
      }, 500);
    }
  };
  // ── Quick register success handler ────────────────────────────────────────
  const handleQuickRegisterSuccess = (res) => {
    const userData =
      res?.user_info || res?.userinfo || res?.user || res?.data || res;

    if (userData && (userData.id || userData.username)) {
      setSelectedCustomer(userData);
      setCustomerSearch("");
      setCustomers([]);

      const name = userData.name || userData.username || "Customer";
      toast.success(`${name} registered and selected!`);

      setTimeout(() => barcodeRef.current?.focus(), 100);
    } else {
      console.error("User data structure mismatch:", res);
      toast.error(
        "Registration done, but could not auto-select. Please search manually.",
      );
    }
  };

  // ── Checkout + print logic ────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty!");
      return;
    }
    if (!selectedCustomer) {
      toast.error("Please select a customer!");
      return;
    }

    // --- SweetAlert2 Confirmation ---
    const result = await Swal.fire({
      title: "Confirm Order?",
      text: `Total Amount: ${formatBDT(dynamicSubtotal)}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0f172a", // আপনার স্লেট-৯০০ থিমের সাথে মিল রেখে
      cancelButtonColor: "#f43f5e",
      confirmButtonText: "Yes, Place Order!",
      cancelButtonText: "Cancel",
      background: "#ffffff",
      borderRadius: "1.25rem",
      customClass: {
        popup: "rounded-3xl",
        confirmButton: "rounded-xl px-6 py-3 font-bold",
        cancelButton: "rounded-xl px-6 py-3 font-bold",
      },
    });

    if (!result.isConfirmed) return;

    const orderData = {
      customer_id: selectedCustomer.id,
      payment_method: "Cash",
      items: cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: getEffectivePrice(item),
      })),
    };

    setIsSubmitting(true);
    try {
      const res = await api.post("pos/order/create/", orderData);

      setLastOrder(res.data);
      setPrintCart([...cart]);

      // অর্ডার সাকসেস মেসেজটাও SweetAlert দিয়ে দিতে পারেন (ঐচ্ছিক)
      Swal.fire({
        title: "Success!",
        text: "Order has been placed successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(async () => {
        await handlePrint();
        clearCart();
        setSelectedCustomer(null);
        setBarcode("");
        barcodeRef.current?.focus();
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Order failed!";
      toast.error(errorMsg);

      Swal.fire({
        title: "Failed!",
        text: errorMsg,
        icon: "error",
        confirmButtonColor: "#0f172a",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    beepRef.current = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3",
    );
    barcodeRef.current?.focus();
  }, []);

  const playBeep = () => beepRef.current?.play().catch(() => {});

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Toaster position="top-right" reverseOrder={false} />

      {/* ── Page Header ── */}
      <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
            <span className="text-white text-xs font-black">SB</span>
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-sm leading-tight tracking-tight">
              Sofol Bangla Shop
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              Point of Sale
            </p>
          </div>
        </div>

        {/* Live date/time indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Terminal Active
        </div>
      </header>

      {/* ── Main Grid ── */}
      <main className="max-w-[1600px] mx-auto p-6 lg:p-8 grid grid-cols-12 gap-6">
        {/* ── Left Column ── */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
          {/* Top row: Customer + Scanner */}
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

          {/* Quick Register — shown only when no customer selected */}
          {!selectedCustomer && (
            <QuickRegister onRegisterSuccess={handleQuickRegisterSuccess} />
          )}

          {/* Cart */}
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

        {/* ── Right Column ── */}
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
      </main>

      {/* ── Hidden Thermal Invoice (for printing) ── */}
      <div style={{ display: "none" }}>
        <div ref={invoiceRef}>
          <ThermalInvoice
            orderData={lastOrder}
            cart={printCart}
            customer={selectedCustomer}
            subtotal={dynamicSubtotal}
            formatBDT={formatBDT}
            getEffectivePrice={getEffectivePrice}
          />
        </div>
      </div>
    </div>
  );
}

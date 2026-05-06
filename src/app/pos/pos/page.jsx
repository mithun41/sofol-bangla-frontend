"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { toast, Toaster } from "react-hot-toast";
import api from "@/services/api";
import { useReactToPrint } from "react-to-print";

import CustomerSearch from "../components/pos/CustomerSearch";
import ProductScanner from "../components/pos/ProductScanner";
import CartTable from "../components/pos/CartTable";
import OrderSummary from "../components/pos/OrderSummary";
import QuickRegister from "../components/pos/QuickRegister";
import ThermalInvoice from "../components/pos/ThermalInvoice";
import Swal from "sweetalert2";

// ─── Formatter ────────────────────────────────────────────────────────────────
const formatBDT = (value) => {
  const n = Number(value || 0);
  return `৳${n.toFixed(2).replace(/\.00$/, "")}`;
};

export default function POSPage() {

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
  const [isAdding, setIsAdding] = useState(false); 

  const handlePrint = useReactToPrint({ contentRef: invoiceRef });
const [cart, setCart] = useState([]);

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [
        ...prev,
        {
          ...product,
          cartItemId: product.id,
          quantity,
          point_value: Number(product.point_value || 0),
          item_subtotal: Number(product.price) * quantity,
        },
      ];
    });
  };

  const updateQuantity = (id, cartItemId, change) => {
    setCart((prev) =>
      prev
        .map((i) => i.id === id ? { ...i, quantity: i.quantity + change } : i)
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setCart([]);
  // ── অটো ফোকাস লজিক ──────────────────
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const active = document.activeElement;
      const isAlreadyTyping =
        active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        active.tagName === "SELECT" ||
        active.isContentEditable;

      if (isAlreadyTyping) return;

      const clickedElement = e.target;
      const isInteractive =
        clickedElement.tagName === "INPUT" ||
        clickedElement.tagName === "TEXTAREA" ||
        clickedElement.tagName === "SELECT" ||
        clickedElement.closest("button") ||
        clickedElement.closest(".customer-dropdown") ||
        clickedElement.closest(".swal2-container");

      if (!isInteractive) {
        setTimeout(() => {
          if (document.activeElement.tagName === "BODY" || document.activeElement.tagName === "DIV") {
            barcodeRef.current?.focus();
          }
        }, 50);
      }
    };

    window.addEventListener("mouseup", handleGlobalClick);
    return () => window.removeEventListener("mouseup", handleGlobalClick);
  }, []);

  const getEffectivePrice = (item) => {
    const basePrice = parseFloat(item.price || 0);
    const pv = parseFloat(item.point_value || 0);
    const isMemberActive = selectedCustomer?.status?.toLowerCase() === "active";
    return isMemberActive ? basePrice - pv * 2 : basePrice;
  };

  const dynamicSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + getEffectivePrice(item) * item.quantity, 0);
  }, [cart, selectedCustomer]);

  // ── Customer search ──
  useEffect(() => {
    if (customerSearch.length < 2) {
      setCustomers([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`pos/customers/search/?q=${encodeURIComponent(customerSearch)}`);
        setCustomers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [customerSearch]);

  // ── Product search ──
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
        const res = await api.get(`pos/products/search/?q=${encodeURIComponent(q)}`);
        setSearchResults(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── ১. বারকোড স্ক্যানার হ্যান্ডলার (FIXED: handleScan name added) ──
 

const handleScan = async (e) => {
  if (e) e.preventDefault();
  const code = barcode.trim();
  if (!code || scanLoading || isAdding) return; // ← isAdding guard

  setScanLoading(true);
  setIsAdding(true);
  setBarcode("");

  try {
    const res = await api.get(`pos/products/search/?q=${encodeURIComponent(code)}`);
    const product = Array.isArray(res.data) ? res.data[0] : res.data;

    if (product) {
      await addToCart(product); // ← await করো
      playBeep();
    } else {
      toast.error("Product not found!");
    }
  } catch (err) {
    toast.error("Scan failed!");
  } finally {
    setScanLoading(false);
    setIsAdding(false);
    barcodeRef.current?.focus();
  }
};

  // ── ২. প্রোডাক্ট সিলেক্ট হ্যান্ডলার (Centralized logic) ──
  const handleSelectProduct = (product) => {
    if (product) {
      addToCart(product);
      playBeep();
      setSearchOpen(false);
      setSearchQuery("");
      setBarcode(""); // স্ক্যানার ক্লিয়ার
      setTimeout(() => barcodeRef.current?.focus(), 100);
    }
  };

  const handleQuickRegisterSuccess = (res) => {
    const userData = res?.user_info || res?.userinfo || res?.user || res?.data || res;
    if (userData && (userData.id || userData.username)) {
      setSelectedCustomer(userData);
      setCustomerSearch("");
      setCustomers([]);
      toast.success("Customer selected!");
      setTimeout(() => barcodeRef.current?.focus(), 100);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || !selectedCustomer) {
      toast.error("Cart empty or customer not selected!");
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Order?",
      text: `Total: ${formatBDT(dynamicSubtotal)}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
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

      Swal.fire({ title: "Success!", icon: "success", timer: 1500, showConfirmButton: false });

      setTimeout(async () => {
        await handlePrint();
        clearCart();
        setSelectedCustomer(null);
        setBarcode("");
        barcodeRef.current?.focus();
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.error || "Order failed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    beepRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
    barcodeRef.current?.focus();
  }, []);

  const playBeep = () => beepRef.current?.play().catch(() => {});

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Toaster position="top-right" />

      <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
            <span className="text-white text-xs font-black">SB</span>
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-sm leading-tight">Sofol Bangla Shop</h1>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Point of Sale</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Terminal Active
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 lg:p-8 grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-5">
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
              handleScan={handleScan} // FIXED: handlescan পাস হচ্ছে
              barcodeRef={barcodeRef}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchOpen={searchOpen}
              searchLoading={searchLoading}
              searchResults={searchResults}
              setSearchOpen={setSearchOpen}
              playBeep={playBeep}
              formatBDT={formatBDT}
              onSelectProduct={handleSelectProduct} // FIXED: handleSelectProduct পাস হচ্ছে
            />
          </div>

          {!selectedCustomer && <QuickRegister onRegisterSuccess={handleQuickRegisterSuccess} />}

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
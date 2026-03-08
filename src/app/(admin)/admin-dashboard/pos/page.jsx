"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { toast, Toaster } from "react-hot-toast"; // Toaster অ্যাড করলাম
import api from "@/services/api";
import { useReactToPrint } from "react-to-print"; // ইম্পোর্ট নিশ্চিত কর

import CustomerSearch from "../../components/pos/CustomerSearch";
import ProductScanner from "../../components/pos/ProductScanner";
import CartTable from "../../components/pos/CartTable";
import OrderSummary from "../../components/pos/OrderSummary";
import QuickRegister from "../../components/pos/QuickRegister";
import ThermalInvoice from "../../components/pos/ThermalInvoice";

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

  // প্রিন্ট স্টেট
  const [lastOrder, setLastOrder] = useState(null);
  const [printCart, setPrintCart] = useState([]);
  const invoiceRef = useRef();

  const barcodeRef = useRef(null);
  const beepRef = useRef(null);

  // প্রিন্ট কনফিগারেশন
  const handlePrint = useReactToPrint({
    contentRef: invoiceRef, // latest version অনুযায়ী contentRef ব্যবহার করা ভালো
  });

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

  const handleQuickRegisterSuccess = (newCustomer) => {
    setSelectedCustomer(newCustomer);
    setCustomerSearch("");
    toast.success(`${newCustomer.username} এখন সিলেক্টেড!`);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("কার্টে কোনো প্রোডাক্ট নেই!");
      return;
    }
    if (!selectedCustomer) {
      toast.error("দয়া করে একজন কাস্টমার সিলেক্ট করুন!");
      return;
    }

    if (!window.confirm("আপনি কি এই বিক্রিটি সম্পন্ন করতে চান?")) return;

    const orderData = {
      customer_id: selectedCustomer.id,
      payment_method: "Cash",
      items: cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: getEffectivePrice(item), // ডিসকাউন্টেড প্রাইস পাঠানো
      })),
    };

    setIsSubmitting(true);
    try {
      const res = await api.post("pos/order/create/", orderData);

      // প্রিন্টের জন্য ডাটা সেট করা
      setLastOrder(res.data);
      setPrintCart([...cart]); // কার্ট ক্লিয়ার হওয়ার আগে ডাটা কপি করে রাখা

      toast.success("বিক্রি সফল হয়েছে!");

      // একটু সময় দিয়ে প্রিন্ট ডায়ালগ ওপেন করা
      setTimeout(() => {
        handlePrint();
        clearCart();
        setSelectedCustomer(null);
      }, 500);
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
      <Toaster position="top-right" /> {/* ✅ টোস্ট কাজ না করলে এটা মাস্ট */}
      <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-8">
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
      {/* ✅ হিডেন ইনভয়েস কম্পোনেন্ট */}
      <div className="hidden">
        <ThermalInvoice
          ref={invoiceRef}
          orderData={lastOrder}
          cart={printCart}
          customer={selectedCustomer}
          subtotal={dynamicSubtotal}
          formatBDT={formatBDT}
          getEffectivePrice={getEffectivePrice}
        />
      </div>
    </div>
  );
}

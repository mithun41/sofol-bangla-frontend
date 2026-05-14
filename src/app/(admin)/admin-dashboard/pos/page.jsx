import React from 'react'

export default function page() {
  return (
    <div>page</div>
  )
}
// "use client";

// import { useEffect, useState, useRef, useCallback, useReducer } from "react";
// import { useCart } from "@/context/CartContext";
// import { toast, Toaster } from "react-hot-toast";
// import api from "@/services/api";
// import { useReactToPrint } from "react-to-print";
// import Swal from "sweetalert2";

// import CustomerSearch from "../components/pos/CustomerSearch";
// import ProductScanner from "../components/pos/ProductScanner";
// import CartTable from "../components/pos/CartTable";
// import OrderSummary from "../components/pos/OrderSummary";
// // import QuickRegister from "../components/pos/QuickRegister";
// // import ThermalInvoice from "../components/pos/ThermalInvoice";
// import HeldOrders from "../components/pos/HeldOrders";
// import ExchangeModal from "../components/pos/ExchangeModal";

// // ── Formatter ──────────────────────────────────────────────────────────────────
// export const formatBDT = (value) => {
//   const n = Number(value || 0);
//   return `৳${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
// };

// // ── Held Orders Reducer ────────────────────────────────────────────────────────
// const heldReducer = (state, action) => {
//   switch (action.type) {
//     case "HOLD":
//       return [...state, { id: Date.now(), ...action.payload }];
//     case "RESTORE":
//       return state.filter((o) => o.id !== action.id);
//     case "DELETE":
//       return state.filter((o) => o.id !== action.id);
//     default:
//       return state;
//   }
// };

// export default function POSPage() {
//   const { cart, addToCart, updateQuantity, removeFromCart, clearCart, restoreCart } = useCart();

//   // ── Scan / Search ─────────────────────────────────────────────────────────────
//   const [barcode, setBarcode]             = useState("");
//   const [scanLoading, setScanLoading]     = useState(false);
//   const [searchQuery, setSearchQuery]     = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [searchOpen, setSearchOpen]       = useState(false);
//   const [searchLoading, setSearchLoading] = useState(false);

//   // ── Customer ──────────────────────────────────────────────────────────────────
//   const [customerSearch, setCustomerSearch]     = useState("");
//   const [customers, setCustomers]               = useState([]);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);

//   // ── Payment ───────────────────────────────────────────────────────────────────
//   const [discountType, setDiscountType]   = useState("flat");
//   const [discountValue, setDiscountValue] = useState("");
//   const [cashTendered, setCashTendered]   = useState("");

//   // ── Exchange ──────────────────────────────────────────────────────────────────
//   const [showExchange, setShowExchange]         = useState(false);
//   const [exchangeCredit, setExchangeCredit]     = useState(0);
//   const [exchangeItems, setExchangeItems]       = useState([]);   // returned items snapshot
//   const [exchangeOrderRef, setExchangeOrderRef] = useState(null); // original order id

//   // ── UI ────────────────────────────────────────────────────────────────────────
//   const [isSubmitting, setIsSubmitting]   = useState(false);
//   const [showHeld, setShowHeld]           = useState(false);
//   const [heldOrders, dispatch]            = useReducer(heldReducer, []);

//   // ── Print ─────────────────────────────────────────────────────────────────────
//   const [lastOrder, setLastOrder]   = useState(null);
//   const [printCart, setPrintCart]   = useState([]);
//   const [printMeta, setPrintMeta]   = useState({});
//   const invoiceRef                  = useRef();
//   const barcodeRef                  = useRef(null);
//   const beepRef                     = useRef(null);

//   const handlePrint = useReactToPrint({ contentRef: invoiceRef });

//   // ── Calculated values ──────────────────────────────────────────────────────────
//   const getEffectivePrice = useCallback((item) => {
//     const base = parseFloat(item.price || 0);
//     const pv   = parseFloat(item.point_value || 0);
//     const isActiveMember = selectedCustomer?.status?.toLowerCase() === "active";
//     return isActiveMember ? base - pv * 2 : base;
//   }, [selectedCustomer]);

//   const getMemberSavingPerItem = useCallback((item) => {
//     const base = parseFloat(item.price || 0);
//     const pv   = parseFloat(item.point_value || 0);
//     const isActiveMember = selectedCustomer?.status?.toLowerCase() === "active";
//     return isActiveMember ? pv * 2 : 0;
//   }, [selectedCustomer]);

//   const subtotal = cart.reduce((acc, item) => acc + getEffectivePrice(item) * item.quantity, 0);

//   // Total member savings on cart (before manual discount)
//   const totalMemberSavings = cart.reduce(
//     (acc, item) => acc + getMemberSavingPerItem(item) * item.quantity, 0
//   );

//   const discountAmount = (() => {
//     const val = parseFloat(discountValue) || 0;
//     if (!val) return 0;
//     if (discountType === "percent") return Math.min((subtotal * val) / 100, subtotal);
//     return Math.min(val, subtotal);
//   })();

//   // Exchange credit reduces the payable amount
//   const payable        = Math.max(subtotal - discountAmount - exchangeCredit, 0);
//   const tendered       = parseFloat(cashTendered) || 0;
//   const changeAmount   = Math.max(tendered - payable, 0);

//   // ── Focus logic ────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     const handleGlobalClick = (e) => {
//       const active = document.activeElement;
//       const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(active?.tagName) || active?.isContentEditable;
//       if (isTyping) return;
//       const clicked = e.target;
//       const isInteractive =
//         ["INPUT", "TEXTAREA", "SELECT"].includes(clicked.tagName) ||
//         clicked.closest("button") ||
//         clicked.closest(".customer-dropdown") ||
//         clicked.closest(".swal2-container");
//       if (!isInteractive) {
//         setTimeout(() => {
//           if (["BODY", "DIV"].includes(document.activeElement?.tagName)) {
//             barcodeRef.current?.focus();
//           }
//         }, 50);
//       }
//     };
//     window.addEventListener("mouseup", handleGlobalClick);
//     return () => window.removeEventListener("mouseup", handleGlobalClick);
//   }, []);

//   // ── Keyboard shortcuts ──────────────────────────────────────────────────────
//   useEffect(() => {
//     const handleKeys = (e) => {
//       if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
//       if (e.key === "F2")  { e.preventDefault(); handleNewSale(); }
//       if (e.key === "F4")  { e.preventDefault(); document.getElementById("discount-input")?.focus(); }
//       if (e.key === "F6")  { e.preventDefault(); document.getElementById("cash-input")?.focus(); }
//       if (e.key === "F7")  { e.preventDefault(); setShowExchange(true); }
//       if (e.key === "F8")  { e.preventDefault(); handleCheckout(); }
//       if (e.key === "F9")  { e.preventDefault(); holdOrder(); }
//     };
//     window.addEventListener("keydown", handleKeys);
//     return () => window.removeEventListener("keydown", handleKeys);
//   }, [cart, selectedCustomer, payable, cashTendered, discountValue]);

//   // ── Customer search ────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (customerSearch.length < 2) { setCustomers([]); return; }
//     const timer = setTimeout(async () => {
//       try {
//         const res = await api.get(`pos/customers/search/?q=${encodeURIComponent(customerSearch)}`);
//         setCustomers(Array.isArray(res.data) ? res.data : []);
//       } catch (err) { console.error(err); }
//     }, 300);
//     return () => clearTimeout(timer);
//   }, [customerSearch]);

//   // ── Product search ───────────────────────────────────────────────────────────
//   useEffect(() => {
//     const q = searchQuery.trim();
//     if (q.length < 2) { setSearchResults([]); setSearchOpen(false); return; }
//     setSearchLoading(true);
//     setSearchOpen(true);
//     const timer = setTimeout(async () => {
//       try {
//         const res = await api.get(`pos/products/search/?q=${encodeURIComponent(q)}`);
//         setSearchResults(Array.isArray(res.data) ? res.data : []);
//       } catch (err) { console.error(err); } finally { setSearchLoading(false); }
//     }, 300);
//     return () => clearTimeout(timer);
//   }, [searchQuery]);

//   // ── Barcode scan ─────────────────────────────────────────────────────────────
//   const handleScan = async (e) => {
//     e.preventDefault();
//     const code = barcode.trim();
//     if (!code || scanLoading) return;
//     setScanLoading(true);
//     try {
//       const res = await api.get(`pos/products/search/?q=${code}`);
//       const product = Array.isArray(res.data) ? res.data[0] : res.data;
//       if (product) {
//         addToCart(product);
//         playBeep();
//         setBarcode("");
//         toast.success(`${product.name} added!`, { duration: 800, position: "bottom-center" });
//       } else {
//         toast.error("Product not found!");
//         setBarcode("");
//       }
//     } catch { toast.error("Scan failed!"); setBarcode(""); }
//     finally {
//       setScanLoading(false);
//       setTimeout(() => barcodeRef.current?.focus(), 300);
//     }
//   };

//   // ── Exchange / Return ─────────────────────────────────────────────────────────
//   const handleExchangeConfirm = ({ credit, items, orderId }) => {
//     setExchangeCredit(credit);
//     setExchangeItems(items);
//     setExchangeOrderRef(orderId);
//     setShowExchange(false);
//     toast.success(`Exchange credit of ${formatBDT(credit)} applied!`, { icon: "🔄" });
//   };

//   const clearExchange = () => {
//     setExchangeCredit(0);
//     setExchangeItems([]);
//     setExchangeOrderRef(null);
//   };

//   // ── Hold Order ────────────────────────────────────────────────────────────────
//   const holdOrder = () => {
//     if (!cart.length) return;
//     dispatch({
//       type: "HOLD",
//       payload: {
//         cart: [...cart],
//         customer: selectedCustomer,
//         discount: { type: discountType, value: discountValue },
//         label: `Hold #${heldOrders.length + 1} — ${new Date().toLocaleTimeString()}`,
//       },
//     });
//     clearCart();
//     setSelectedCustomer(null);
//     setDiscountValue("");
//     setCashTendered("");
//     clearExchange();
//     toast("Order held! F9 to recall.", { icon: "⏸️" });
//   };

//   const restoreHeld = (order) => {
//     if (cart.length > 0) {
//       toast.error("Clear current cart first!");
//       return;
//     }
//     restoreCart(order.cart);
//     setSelectedCustomer(order.customer);
//     setDiscountType(order.discount.type);
//     setDiscountValue(order.discount.value);
//     dispatch({ type: "RESTORE", id: order.id });
//     setShowHeld(false);
//     toast.success("Order restored!");
//   };

//   // ── New Sale ───────────────────────────────────────────────────────────────────
//   const handleNewSale = () => {
//     clearCart();
//     setSelectedCustomer(null);
//     setDiscountValue("");
//     setCashTendered("");
//     setBarcode("");
//     clearExchange();
//     setTimeout(() => barcodeRef.current?.focus(), 100);
//   };

//   // ── Quick register ─────────────────────────────────────────────────────────────
//   const handleQuickRegisterSuccess = (res) => {
//     const userData = res?.user_info || res?.userinfo || res?.user || res?.data || res;
//     if (userData && (userData.id || userData.username)) {
//       setSelectedCustomer(userData);
//       setCustomerSearch("");
//       setCustomers([]);
//       toast.success(`${userData.name || userData.username} selected!`);
//       setTimeout(() => barcodeRef.current?.focus(), 100);
//     } else {
//       toast.error("Registration done — please search manually.");
//     }
//   };

//   // ── Checkout ───────────────────────────────────────────────────────────────────
//   const handleCheckout = async () => {
//     if (!cart.length)         return toast.error("Cart is empty!");
//     if (!selectedCustomer)    return toast.error("Select a customer!");
//     if (tendered > 0 && tendered < payable) return toast.error(`Cash short by ${formatBDT(payable - tendered)}!`);

//     const result = await Swal.fire({
//       title: "Confirm Sale?",
//       html: `
//         <div style="text-align:left;font-size:14px;line-height:2">
//           <div style="display:flex;justify-content:space-between"><span>Subtotal:</span><b>${formatBDT(subtotal)}</b></div>
//           ${totalMemberSavings > 0 ? `<div style="display:flex;justify-content:space-between;color:#059669"><span>Member Savings:</span><b>- ${formatBDT(totalMemberSavings)}</b></div>` : ""}
//           ${discountAmount > 0 ? `<div style="display:flex;justify-content:space-between;color:#16a34a"><span>Discount:</span><b>- ${formatBDT(discountAmount)}</b></div>` : ""}
//           ${exchangeCredit > 0 ? `<div style="display:flex;justify-content:space-between;color:#7c3aed"><span>Exchange Credit:</span><b>- ${formatBDT(exchangeCredit)}</b></div>` : ""}
//           <div style="display:flex;justify-content:space-between;font-size:16px;border-top:1px solid #e2e8f0;margin-top:8px;padding-top:8px"><span><b>Payable:</b></span><b>${formatBDT(payable)}</b></div>
//           ${tendered > 0 ? `<div style="display:flex;justify-content:space-between"><span>Cash:</span><b>${formatBDT(tendered)}</b></div>` : ""}
//           ${changeAmount > 0 ? `<div style="display:flex;justify-content:space-between;color:#2563eb"><span>Change:</span><b>${formatBDT(changeAmount)}</b></div>` : ""}
//         </div>`,
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonColor: "#0f172a",
//       cancelButtonColor: "#f43f5e",
//       confirmButtonText: "✅ Confirm Sale",
//       cancelButtonText: "Cancel",
//       customClass: { popup: "rounded-3xl" },
//     });

//     if (!result.isConfirmed) return;

//     const orderData = {
//       customer_id:      selectedCustomer.id,
//       payment_method:   "Cash",
//       discount_amount:  discountAmount,
//       exchange_credit:  exchangeCredit,
//       exchange_order_ref: exchangeOrderRef,
//       exchange_items:   exchangeItems,
//       items: cart.map((item) => ({
//         product_id: item.id,
//         quantity:   item.quantity,
//         price:      getEffectivePrice(item),
//       })),
//     };

//     setIsSubmitting(true);
//     try {
//       const res = await api.post("pos/order/create/", orderData);

//       const meta = {
//         subtotal,
//         discountAmount,
//         payable,
//         cashTendered: tendered,
//         changeAmount,
//         discountType,
//         discountValue,
//         totalMemberSavings,
//         exchangeCredit,
//         exchangeItems,
//         exchangeOrderRef,
//         customerStatus: selectedCustomer?.status,
//       };
//       setLastOrder(res.data);
//       setPrintCart([...cart]);
//       setPrintMeta(meta);

//       setTimeout(async () => {
//         await handlePrint();
//         handleNewSale();
//       }, 500);

//       Swal.fire({ title: "Sale Complete!", icon: "success", timer: 1500, showConfirmButton: false });
//     } catch (err) {
//       const msg = err.response?.data?.error || "Order failed!";
//       toast.error(msg);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // ── Init ──────────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     beepRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
//     barcodeRef.current?.focus();
//   }, []);

//   const playBeep = () => beepRef.current?.play().catch(() => {});

//   // ─────────────────────────────────────────────────────────────────────────────
//   return (
//     <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
//       <Toaster position="top-right" reverseOrder={false} />

//       {/* ── Header ── */}
//       <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
//         <div className="flex items-center gap-3">
//           <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
//             <span className="text-white text-xs font-black">SB</span>
//           </div>
//           <div>
//             <h1 className="font-black text-slate-900 text-sm leading-tight">Sofol Bangla</h1>
//             <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Point of Sale</p>
//           </div>
//         </div>

//         <div className="flex items-center gap-3">
//           <div className="hidden lg:flex items-center gap-3 text-[9px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
//             <span>F2 New</span><span>·</span>
//             <span>F4 Discount</span><span>·</span>
//             <span>F6 Cash</span><span>·</span>
//             <span>F7 Exchange</span><span>·</span>
//             <span>F8 Pay</span><span>·</span>
//             <span>F9 Hold</span>
//           </div>

//           {/* Exchange credit badge */}
//           {exchangeCredit > 0 && (
//             <button
//               onClick={clearExchange}
//               className="relative flex items-center gap-2 px-3 py-2 bg-violet-50 border border-violet-200 text-violet-700 rounded-xl text-xs font-black"
//               title="Click to remove exchange credit"
//             >
//               🔄 {formatBDT(exchangeCredit)} credit
//               <span className="ml-1 text-violet-400">✕</span>
//             </button>
//           )}

//           {heldOrders.length > 0 && (
//             <button onClick={() => setShowHeld(true)}
//               className="relative flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-black">
//               ⏸ Held
//               <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
//                 {heldOrders.length}
//               </span>
//             </button>
//           )}

//           <button
//             onClick={() => setShowExchange(true)}
//             className="px-3 py-2 bg-violet-600 text-white rounded-xl text-xs font-black uppercase"
//           >
//             F7 Exchange
//           </button>

//           <button onClick={handleNewSale}
//             className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase">
//             F2 New Sale
//           </button>

//           <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
//             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
//             Live
//           </div>
//         </div>
//       </header>

//       {/* ── Main ── */}
//       <main className="max-w-[1600px] mx-auto p-4 lg:p-6 grid grid-cols-12 gap-5">
//         {/* Left */}
//         <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <CustomerSearch
//               selectedCustomer={selectedCustomer}
//               setSelectedCustomer={setSelectedCustomer}
//               customerSearch={customerSearch}
//               setCustomerSearch={setCustomerSearch}
//               customers={customers}
//             />
//             <ProductScanner
//               barcode={barcode}
//               setBarcode={setBarcode}
//               handleScan={handleScan}
//               barcodeRef={barcodeRef}
//               searchQuery={searchQuery}
//               setSearchQuery={setSearchQuery}
//               searchOpen={searchOpen}
//               searchLoading={searchLoading}
//               searchResults={searchResults}
//               addToCart={addToCart}
//               setSearchOpen={setSearchOpen}
//               playBeep={playBeep}
//               formatBDT={formatBDT}
//             />
//           </div>

//           {!selectedCustomer && (
//             <QuickRegister onRegisterSuccess={handleQuickRegisterSuccess} />
//           )}

//           <CartTable
//             cart={cart}
//             getEffectivePrice={getEffectivePrice}
//             getMemberSavingPerItem={getMemberSavingPerItem}
//             updateQuantity={updateQuantity}
//             removeFromCart={removeFromCart}
//             clearCart={clearCart}
//             formatBDT={formatBDT}
//             selectedCustomer={selectedCustomer}
//           />
//         </div>

//         {/* Right — Order Summary */}
//         <div className="col-span-12 lg:col-span-4">
//           <OrderSummary
//             selectedCustomer={selectedCustomer}
//             subtotal={subtotal}
//             totalMemberSavings={totalMemberSavings}
//             discountType={discountType}
//             setDiscountType={setDiscountType}
//             discountValue={discountValue}
//             setDiscountValue={setDiscountValue}
//             discountAmount={discountAmount}
//             exchangeCredit={exchangeCredit}
//             onClearExchange={clearExchange}
//             payable={payable}
//             cashTendered={cashTendered}
//             setCashTendered={setCashTendered}
//             tendered={tendered}
//             changeAmount={changeAmount}
//             handleCheckout={handleCheckout}
//             holdOrder={holdOrder}
//             isSubmitting={isSubmitting}
//             formatBDT={formatBDT}
//             cartLength={cart.length}
//           />
//         </div>
//       </main>

//       {/* ── Held Orders Modal ── */}
//       {showHeld && (
//         <HeldOrders
//           orders={heldOrders}
//           onRestore={restoreHeld}
//           onDelete={(id) => dispatch({ type: "DELETE", id })}
//           onClose={() => setShowHeld(false)}
//           formatBDT={formatBDT}
//         />
//       )}

//       {/* ── Exchange Modal ── */}
//       {showExchange && (
//         <ExchangeModal
//           onConfirm={handleExchangeConfirm}
//           onClose={() => setShowExchange(false)}
//           formatBDT={formatBDT}
//           selectedCustomer={selectedCustomer}
//         />
//       )}

//       {/* ── Hidden Invoice ── */}
//       <div style={{ position: "absolute", top: "-9999px", left: "-9999px", visibility: "hidden" }}>
//         <div ref={invoiceRef}>
//           <ThermalInvoice
//             orderData={lastOrder}
//             cart={printCart}
//             customer={selectedCustomer}
//             meta={printMeta}
//             formatBDT={formatBDT}
//             getEffectivePrice={(item) => {
//               const base = parseFloat(item.price || 0);
//               const pv   = parseFloat(item.point_value || 0);
//               const active = printMeta?.customerStatus?.toLowerCase() === "active";
//               return active ? base - pv * 2 : base;
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
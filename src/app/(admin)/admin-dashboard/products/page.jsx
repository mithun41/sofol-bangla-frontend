"use client";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  Plus, Trash2, Edit, Package, Search, Star,
  AlertCircle, XCircle, LayoutGrid, Printer, Loader2,
} from "lucide-react";
import {
  getAllProducts, deleteProduct, updateProduct,
} from "@/services/productService";
import AddProductModal from "../../components/AddProductModal";
import EditProductModal from "../../components/EditProductModal";
import toast, { Toaster } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import InventoryPDFButton from "./InventoryPDFButton";

// ─────────────────────────────────────────────────────────
// Module-level cache — component unmount/remount তেও টিকবে
// ─────────────────────────────────────────────────────────
const productCache = {
  data: null,
  timestamp: null,
  TTL: 5 * 60 * 1000, // 5 মিনিট valid

  isValid() {
    return this.data !== null && Date.now() - this.timestamp < this.TTL;
  },
  set(data) {
    this.data = data;
    this.timestamp = Date.now();
  },
  invalidate() {
    this.data = null;
    this.timestamp = null;
  },
};

// ─────────────────────────────────────────────────────────
// Infinite scroll — কতটা একবারে দেখাবো
// ─────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

// ─────────────────────────────────────────────────────────
// Barcode Slip
// ─────────────────────────────────────────────────────────
function BarcodeSlip({ product }) {
  if (!product) return null;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "1mm 2mm",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      <div style={{ textAlign: "center", width: "100%" }}>
        <p style={{ fontSize: "10pt", fontWeight: "bold", margin: "0 0 1mm 0", lineHeight: "1", wordBreak: "break-all" }}>
          {product.name}
        </p>
        <p style={{ fontSize: "9pt", fontWeight: "bold", margin: 0 }}>
          Price: ৳{Math.floor(Number(product.price))}
        </p>
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <img
          src={product.barcode_image}
          alt="barcode"
          style={{ width: "95%", height: "12mm", objectFit: "fill", display: "block" }}
        />
        <p style={{ fontSize: "8pt", fontFamily: "monospace", margin: "1mm 0 0 0" }}>
          {product.barcode_number}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────
export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);      // initial load
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Infinite scroll
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const sentinelRef = useRef(null);          // scroll sentinel
  const tableContainerRef = useRef(null);   // scroll container (optional)

  // Print
  const [printProduct, setPrintProduct] = useState(null);
  const barcodePrintRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: barcodePrintRef,
    pageStyle: `
      @page { size: 38mm 25mm landscape; margin: 0; }
      @media print {
        html, body { height: 25mm; width: 38mm; margin: 0 !important; padding: 0 !important; overflow: hidden; }
      }
    `,
    onAfterPrint: () => setPrintProduct(null),
  });

  useEffect(() => {
    if (printProduct) {
      const timer = setTimeout(() => handlePrint(), 300);
      return () => clearTimeout(timer);
    }
  }, [printProduct]);

  const triggerPrint = useCallback((product) => setPrintProduct(product), []);

  // ── Data loading — cache-first ──────────────────────────
  const loadProducts = useCallback(async ({ forceRefresh = false } = {}) => {
    // Cache hit
    if (!forceRefresh && productCache.isValid()) {
      setProducts(productCache.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getAllProducts();
      const all = Array.isArray(res.data) ? res.data : res.data.results;
      productCache.set(all);
      setProducts(all);
    } catch {
      toast.error("Could not load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // Reset visible count when filter/search changes
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [searchTerm, filterStatus]);

  // ── Filtered list (memoized) ─────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const stock = Number(p.stock ?? 0);
      if (filterStatus === "low") return matchesSearch && stock > 0 && stock < 5;
      if (filterStatus === "out") return matchesSearch && stock <= 0;
      return matchesSearch;
    });
  }, [products, searchTerm, filterStatus]);

  // Slice for current page
  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const hasMore = visibleCount < filteredProducts.length;

  // ── IntersectionObserver for sentinel ───────────────────
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
          setIsFetchingMore(true);
          // Slight delay so the spinner is visible
          setTimeout(() => {
            setVisibleCount((prev) => prev + PAGE_SIZE);
            setIsFetchingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore]);

  // ── CRUD helpers ─────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteProduct(id);
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      productCache.set(updated);   // update cache too
      toast.success("Product deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const toggleFeatured = async (product) => {
    const newStatus = !product.is_featured;
    const updated = products.map((p) =>
      p.id === product.id ? { ...p, is_featured: newStatus } : p
    );
    setProducts(updated);
    productCache.set(updated);
    try {
      await updateProduct(product.id, { is_featured: newStatus });
      toast.success(newStatus ? "Featured ⭐" : "Removed Featured");
    } catch {
      loadProducts({ forceRefresh: true });
      toast.error("Update failed");
    }
  };

  const handleAddSuccess = () => {
    productCache.invalidate();          // stale → force refresh
    loadProducts({ forceRefresh: true });
    setIsModalOpen(false);
  };

  const handleEditSuccess = () => {
    productCache.invalidate();
    loadProducts({ forceRefresh: true });
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  // ── Stock badge helper ───────────────────────────────────
  const getStockBadge = (stockRaw) => {
    const stock = Number(stockRaw ?? 0);
    if (stock <= 0) return { label: "Out of Stock", class: "bg-rose-100 text-rose-700 border-rose-200" };
    if (stock < 5)  return { label: "Low Stock",    class: "bg-amber-100 text-amber-800 border-amber-200" };
    return             { label: "In Stock",      class: "bg-emerald-100 text-emerald-800 border-emerald-200" };
  };

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Hidden print area */}
      <div style={{ position: "fixed", top: "-9999px", left: "-9999px", width: "50mm" }}>
        <div ref={barcodePrintRef}>
          <BarcodeSlip product={printProduct} />
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Package className="text-blue-600" /> Inventory
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            Managing {products.length} Products
          </p>
        </div>
        <div className="flex items-center gap-3">
          <InventoryPDFButton products={filteredProducts} filterStatus={filterStatus} />
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl flex items-center gap-2"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="w-full lg:max-w-md bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center">
          <Search className="ml-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full px-4 py-2 bg-transparent outline-none font-bold text-sm text-slate-600 dark:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-full lg:w-auto overflow-x-auto">
          {[
            { key: "all", icon: <LayoutGrid size={14} />, label: "All",          active: "text-blue-600" },
            { key: "low", icon: <AlertCircle size={14} />, label: "Low Stock",   active: "text-amber-600" },
            { key: "out", icon: <XCircle size={14} />,     label: "Out of Stock",active: "text-rose-600" },
          ].map(({ key, icon, label, active }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                filterStatus === key
                  ? `bg-white dark:bg-slate-700 ${active} shadow-sm`
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Legend bar */}
        <div className="px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
            Showing{" "}
            <span className="text-slate-800 dark:text-white">
              {loading ? "…" : `${visibleProducts.length} / ${filteredProducts.length}`}
            </span>{" "}
            products
          </p>
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> In Stock</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Low</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block" /> Out</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60">
                {[
                  { label: "Fav" }, { label: "Product" }, { label: "Barcode" },
                  { label: "Stock" }, { label: "Price" }, { label: "PV" },
                  { label: "Actions", right: true },
                ].map((h) => (
                  <th
                    key={h.label}
                    className={`px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 ${h.right ? "text-right" : ""}`}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-50 dark:border-slate-800/60 animate-pulse">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded-lg w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : visibleProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20 text-slate-400 text-sm font-bold">
                    No products found
                  </td>
                </tr>
              ) : (
                visibleProducts.map((p) => {
                  const badge    = getStockBadge(p.stock);
                  const stock    = Number(p.stock ?? 0);
                  const dotColor = stock <= 0 ? "bg-rose-500" : stock < 5 ? "bg-amber-400" : "bg-emerald-400";
                  const priceText= stock <= 0 ? "text-rose-500" : stock < 5 ? "text-amber-600 dark:text-amber-400" : "text-slate-700 dark:text-slate-200";

                  return (
                    <tr
                      key={p.id}
                      className="border-t border-slate-50 dark:border-slate-800/60 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Star */}
                      <td className="px-5 py-4 w-10">
                        <button
                          onClick={() => toggleFeatured(p)}
                          className={`transition-colors ${p.is_featured ? "text-amber-400" : "text-slate-200 hover:text-amber-300"}`}
                        >
                          <Star size={17} fill={p.is_featured ? "currentColor" : "none"} />
                        </button>
                      </td>

                      {/* Product */}
                      <td className="px-5 py-4 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img src={p.image} className="w-11 h-11 rounded-xl object-cover bg-slate-100" alt={p.name} />
                            <span className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${dotColor}`} />
                          </div>
                          <div>
                            <p className="font-black text-xs text-slate-800 dark:text-white leading-snug">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{p.category_name || "General"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Barcode */}
                      <td className="px-5 py-4">
                        {p.barcode_image ? (
                          <button
                            onClick={() => triggerPrint(p)}
                            className="group/btn relative flex flex-col items-start gap-0.5"
                            title="Print barcode"
                          >
                            <div className="relative overflow-hidden rounded-lg">
                              <img src={p.barcode_image} alt="barcode" className="h-7 w-auto group-hover/btn:opacity-30 transition-opacity" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/btn:opacity-100 transition-opacity">
                                <Printer size={14} className="text-blue-600" />
                              </div>
                            </div>
                            <p className="text-[9px] font-mono text-slate-400">{p.barcode_number}</p>
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-300 italic">No barcode</span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
                          <div>
                            <p className={`text-xs font-black ${priceText}`}>{stock} pcs</p>
                            <p className="text-[9px] text-slate-400 font-semibold">{badge.label}</p>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-4">
                        <p className="text-xs font-black text-slate-800 dark:text-white">
                          ৳{Number(p.price).toLocaleString()}
                        </p>
                      </td>

                      {/* PV */}
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black rounded-lg">
                          {p.point_value} PV
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setSelectedProduct(p); setIsEditModalOpen(true); }}
                            className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 text-slate-400 transition-all"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 text-slate-400 transition-all"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* ── Scroll sentinel + spinner ── */}
          {!loading && hasMore && (
            <div ref={sentinelRef} className="flex items-center justify-center py-6 gap-2 text-slate-400">
              {isFetchingMore ? (
                <>
                  <Loader2 size={16} className="animate-spin text-blue-500" />
                  <span className="text-xs font-bold">Loading more…</span>
                </>
              ) : (
                /* invisible sentinel when not actively spinning */
                <span className="h-1" />
              )}
            </div>
          )}

          {/* End-of-list message */}
          {!loading && !hasMore && filteredProducts.length > PAGE_SIZE && (
            <div className="flex items-center justify-center py-5">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                All {filteredProducts.length} products loaded
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <AddProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleAddSuccess}
        />
      )}
      {isEditModalOpen && selectedProduct && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedProduct(null); }}
          onSuccess={handleEditSuccess}
          product={selectedProduct}
        />
      )}
    </div>
  );
}
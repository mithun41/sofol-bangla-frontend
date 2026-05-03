"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  Plus, Trash2, Edit, Package, Search, Star,
  AlertCircle, XCircle, LayoutGrid, Printer,
} from "lucide-react";
import {
  getAllProducts, deleteProduct, updateProduct,
} from "@/services/productService";
import AddProductModal from "../../components/AddProductModal";
import EditProductModal from "../../components/EditProductModal";
import toast, { Toaster } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";

// ────────────────────────────────────────────────
// Barcode slip — এটাই print হবে
// ────────────────────────────────────────────────
function BarcodeSlip({ product }) {
  if (!product) return null;
  return (
    <div
      style={{
        width: "50mm",
        padding: "1mm 2mm",
        fontFamily: "monospace",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}
    >
      <p style={{ fontSize: "6pt", fontWeight: "bold", textAlign: "center", margin: 0, lineHeight: "1.2", wordBreak: "break-word", width: "100%" }}>
        {product.name}
      </p>
      <p style={{ fontSize: "6pt", margin: "0.5mm 0 0.5mm 0", lineHeight: "1", textAlign: "center" }}>
        Price: ৳{Math.floor(Number(product.price))}
      </p>
      <img
        src={product.barcode_image}
        alt="barcode"
        style={{ width: "70%", height: "auto", maxHeight: "10mm", objectFit: "contain", display: "block", margin: 0 }}
      />
    </div>
  );
}

// ────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────
export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // print এর জন্য আলাদা state — selectedProduct এর সাথে mix করব না
  const [printProduct, setPrintProduct] = useState(null);
  const barcodePrintRef = useRef();

  // useReactToPrint — onAfterPrint এ cleanup
  const handlePrint = useReactToPrint({
    contentRef: barcodePrintRef,
    pageStyle: `
      @page {
        size: 50mm auto;   /* slip width, height auto */
        margin: 0;
      }
      @media print {
        body { margin: 0; }
      }
    `,
    onAfterPrint: () => setPrintProduct(null),
  });

  // printProduct state set হলে তারপর print — useEffect দিয়ে
  // এটাই আসল fix: state update → re-render → তারপর print
  useEffect(() => {
    if (printProduct) {
      // একটু wait করি যেন BarcodeSlip DOM এ render হয়
      const timer = setTimeout(() => handlePrint(), 150);
      return () => clearTimeout(timer);
    }
  }, [printProduct]);

  const triggerPrint = useCallback((product) => {
    setPrintProduct(product);
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await getAllProducts();
      const all = Array.isArray(res.data) ? res.data : res.data.results;
      setProducts(all);
    } catch {
      toast.error("Could not load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const toggleFeatured = async (product) => {
    const newStatus = !product.is_featured;
    setProducts((prev) =>
      prev.map((p) => p.id === product.id ? { ...p, is_featured: newStatus } : p)
    );
    try {
      await updateProduct(product.id, { is_featured: newStatus });
      toast.success(newStatus ? "Featured ⭐" : "Removed Featured");
    } catch {
      loadProducts();
      toast.error("Update failed");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const stock = Number(p.stock ?? 0);
    if (filterStatus === "low") return matchesSearch && stock > 0 && stock < 5;
    if (filterStatus === "out") return matchesSearch && stock <= 0;
    return matchesSearch;
  });

  const getStockBadge = (stockRaw) => {
    const stock = Number(stockRaw ?? 0);
    if (stock <= 0) return { label: "Out of Stock", class: "bg-rose-100 text-rose-700 border-rose-200" };
    if (stock < 5)  return { label: "Low Stock",    class: "bg-amber-100 text-amber-800 border-amber-200" };
    return             { label: "In Stock",      class: "bg-emerald-100 text-emerald-800 border-emerald-200" };
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

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
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl flex items-center gap-2"
        >
          <Plus size={18} /> Add Product
        </button>
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
            { key: "all", icon: <LayoutGrid size={14} />, label: "All", active: "text-blue-600" },
            { key: "low", icon: <AlertCircle size={14} />, label: "Low Stock", active: "text-amber-600" },
            { key: "out", icon: <XCircle size={14} />, label: "Out of Stock", active: "text-rose-600" },
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
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b">
              <tr>
                {["Fav", "Product", "Barcode", "Stock", "Price / PV", "Action"].map((h) => (
                  <th key={h} className={`px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest ${h === "Action" ? "text-right" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400 text-sm font-bold">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const badge = getStockBadge(p.stock);
                  return (
                    <tr key={p.id} className="group hover:bg-slate-50/50 transition-all">
                      {/* Featured */}
                      <td className="px-6 py-4">
                        <button onClick={() => toggleFeatured(p)} className={p.is_featured ? "text-amber-400" : "text-slate-200"}>
                          <Star size={18} fill={p.is_featured ? "currentColor" : "none"} />
                        </button>
                      </td>

                      {/* Product info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={p.image} className="w-10 h-10 rounded-xl object-cover" alt={p.name} />
                          <div>
                            <p className="font-black text-xs">{p.name}</p>
                            <p className="text-[9px] text-slate-400">{p.category_name || "General"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Barcode + print button */}
                      <td className="px-6 py-4">
                        {p.barcode_image ? (
                          <button
                            onClick={() => triggerPrint(p)}
                            className="group/btn flex flex-col items-start gap-1 relative"
                            title="Click to print barcode"
                          >
                            <div className="relative">
                              <img
                                src={p.barcode_image}
                                alt="barcode"
                                className="h-7 w-auto group-hover/btn:opacity-40 transition-opacity"
                              />
                              <Printer
                                size={14}
                                className="absolute inset-0 m-auto text-blue-600 opacity-0 group-hover/btn:opacity-100 transition-opacity"
                              />
                            </div>
                            <p className="text-[9px] font-mono text-slate-400">{p.barcode_number}</p>
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-300">No Barcode</span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${badge.class}`}>
                          {p.stock} — {badge.label}
                        </span>
                      </td>

                      {/* Price / PV */}
                      <td className="px-6 py-4">
                        <p className="font-black text-xs">৳{Math.floor(p.price)}</p>
                        <p className="text-[9px] font-bold text-emerald-500 uppercase">{p.point_value} PV</p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => { setSelectedProduct(p); setIsEditModalOpen(true); }}
                            className="p-2 hover:text-blue-600 transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Hidden print area ─────────────────────────────
          display:none এর বদলে visibility:hidden + position:absolute
          কারণ display:none হলে কিছু browser print করে না       */}
      <div
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          visibility: "hidden",
        }}
      >
        <div ref={barcodePrintRef}>
          <BarcodeSlip product={printProduct} />
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <AddProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { loadProducts(); setIsModalOpen(false); }}
        />
      )}
      {isEditModalOpen && selectedProduct && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedProduct(null); }}
          onSuccess={() => { loadProducts(); setIsEditModalOpen(false); setSelectedProduct(null); }}
          product={selectedProduct}
        />
      )}
    </div>
  );
}
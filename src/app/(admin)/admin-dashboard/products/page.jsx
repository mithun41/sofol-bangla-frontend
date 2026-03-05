"use client";
import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Package,
  Search,
  Loader2,
  Star,
  AlertCircle,
  XCircle,
  LayoutGrid,
} from "lucide-react";
import {
  getAllProducts,
  deleteProduct,
  updateProduct,
} from "@/services/productService";
import AddProductModal from "../../components/AddProductModal";
import EditProductModal from "../../components/EditProductModal";
import toast, { Toaster } from "react-hot-toast";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ ফিল্টার স্টেট: 'all', 'low', 'out'
  const [filterStatus, setFilterStatus] = useState("all");

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await getAllProducts();
      const allProducts = Array.isArray(res.data) ? res.data : res.data.results;
      setProducts(allProducts);
    } catch (err) {
      toast.error("Could not load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("Are you sure?")) {
      try {
        await deleteProduct(id);
        setProducts(products.filter((p) => p.id !== id));
        toast.success("Product deleted");
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  const toggleFeatured = async (product) => {
    const newStatus = !product.is_featured;
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, is_featured: newStatus } : p,
      ),
    );
    try {
      await updateProduct(product.id, { is_featured: newStatus });
      toast.success(newStatus ? "Featured ⭐" : "Removed Featured");
    } catch (err) {
      loadProducts();
      toast.error("Update failed");
    }
  };

  // ✅ অ্যাডভান্সড ফিল্টারিং লজিক
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const stock = Number(p.stock ?? 0);

    if (filterStatus === "low") return matchesSearch && stock > 0 && stock < 5;
    if (filterStatus === "out") return matchesSearch && stock <= 0;
    return matchesSearch;
  });

  const getStockBadge = (stockRaw) => {
    const stock = Number(stockRaw ?? 0);
    if (stock <= 0)
      return {
        label: "Out of Stock",
        class: "bg-rose-100 text-rose-700 border-rose-200",
      };
    if (stock < 5)
      return {
        label: "Low Stock",
        class: "bg-amber-100 text-amber-800 border-amber-200",
      };
    return {
      label: "In Stock",
      class: "bg-emerald-100 text-emerald-800 border-emerald-200",
    };
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
            Manging {products.length} Products
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl flex items-center gap-2"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* ✅ সার্চ এবং কুইক ফিল্টার বাটনসমূহ */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        {/* Search Bar */}
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

        {/* Filter Buttons */}
        <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl w-full lg:w-auto overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setFilterStatus("all")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filterStatus === "all" ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <LayoutGrid size={14} /> All
          </button>
          <button
            onClick={() => setFilterStatus("low")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filterStatus === "low" ? "bg-white dark:bg-slate-700 text-amber-600 shadow-sm" : "text-slate-500 hover:text-amber-500"}`}
          >
            <AlertCircle size={14} /> Low Stock
          </button>
          <button
            onClick={() => setFilterStatus("out")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filterStatus === "out" ? "bg-white dark:bg-slate-700 text-rose-600 shadow-sm" : "text-slate-500 hover:text-rose-500"}`}
          >
            <XCircle size={14} /> Out of Stock
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-800">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Fav
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Product
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Stock
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Price / PV
                </th>
                <th className="px-6 py-5 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-blue-600"
                      size={32}
                    />
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-20 text-center text-slate-400 font-bold"
                  >
                    No products found for this filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const badge = getStockBadge(p.stock);
                  return (
                    <tr
                      key={p.id}
                      className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all"
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleFeatured(p)}
                          className={`transition-transform hover:scale-125 ${p.is_featured ? "text-amber-400" : "text-slate-200 dark:text-slate-700"}`}
                        >
                          <Star
                            size={18}
                            fill={p.is_featured ? "currentColor" : "none"}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            className="w-10 h-10 rounded-xl object-cover border dark:border-slate-700"
                            alt=""
                          />
                          <div>
                            <p className="font-black text-slate-800 dark:text-white text-xs">
                              {p.name}
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">
                              {p.category_name || "General"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${badge.class}`}
                        >
                          {p.stock} - {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-black text-slate-800 dark:text-white text-xs">
                          ৳{Math.floor(p.price)}
                        </p>
                        <p className="text-[9px] font-bold text-emerald-500 uppercase">
                          {p.point_value} PV
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedProduct(p);
                              setIsEditModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl"
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

      {/* Modals */}
      {isModalOpen && (
        <AddProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            loadProducts();
            setIsModalOpen(false);
          }}
        />
      )}
      {isEditModalOpen && selectedProduct && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            loadProducts();
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
        />
      )}
    </div>
  );
}

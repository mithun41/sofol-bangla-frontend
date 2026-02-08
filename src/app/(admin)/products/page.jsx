"use client";
import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Package,
  Search,
  Loader2,
  Star, // Featured এর জন্য
} from "lucide-react";
// productService এ updateProduct ফাংশনটি থাকতে হবে
import {
  getAllProducts,
  deleteProduct,
  updateProduct,
} from "@/services/productService";
import AddProductModal from "../components/AddProductModal";
import EditProductModal from "../components/EditProductModal";
import toast, { Toaster } from "react-hot-toast";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await getAllProducts();
      setProducts(Array.isArray(res.data) ? res.data : res.data.results);
    } catch (err) {
      toast.error("Could not load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // --- Featured Toggle Logic ---
  const toggleFeatured = async (product) => {
    const newStatus = !product.is_featured;
    // UI দ্রুত আপডেট করার জন্য (Optimistic Update)
    const updatedProducts = products.map((p) =>
      p.id === product.id ? { ...p, is_featured: newStatus } : p,
    );
    setProducts(updatedProducts);

    try {
      // ব্যাকএন্ডে আপডেট পাঠানো
      await updateProduct(product.id, { is_featured: newStatus });
      toast.success(newStatus ? "Added to Featured" : "Removed from Featured", {
        icon: "⭐",
        duration: 2000,
      });
    } catch (err) {
      // এরর হলে আগের অবস্থায় ফিরিয়ে নেওয়া
      setProducts(products);
      toast.error("Failed to update featured status");
    }
  };

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

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Package className="text-blue-600" /> Inventory Management
          </h1>
          <p className="text-sm text-slate-500">
            Total {products.length} products
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} /> Add New
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Featured
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Product Info
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Price & Point
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-600" />
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all"
                  >
                    {/* --- Featured Toggle Star --- */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleFeatured(p)}
                        className={`transition-all transform hover:scale-125 ${p.is_featured ? "text-amber-400" : "text-slate-300 dark:text-slate-700 hover:text-amber-200"}`}
                      >
                        <Star
                          size={22}
                          fill={p.is_featured ? "currentColor" : "none"}
                        />
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                        />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">
                            {p.category_name || "General"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-black text-slate-800 dark:text-white">
                        ৳{Math.floor(p.price)}
                      </p>
                      <p className="text-[10px] font-bold text-emerald-500">
                        {p.point_value} PV Reward
                      </p>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
          onSuccess={loadProducts}
        />
      )}
      {isEditModalOpen && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          onSuccess={loadProducts}
          product={selectedProduct}
        />
      )}
    </div>
  );
}

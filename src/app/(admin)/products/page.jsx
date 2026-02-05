"use client";
import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Package,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getAllProducts, deleteProduct } from "@/services/productService";
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

  // প্রোডাক্ট লোড করার ফাংশন
  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await getAllProducts();
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products");
      toast.error("Could not load products from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ডিলিট হ্যান্ডলার
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const loadingToast = toast.loading("Deleting product...");
      try {
        await deleteProduct(id);
        setProducts(products.filter((p) => p.id !== id));
        toast.success("Product deleted successfully", { id: loadingToast });
      } catch (err) {
        toast.error("Failed to delete product", { id: loadingToast });
      }
    }
  };

  // এডিট মোডাল ওপেন
  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  // সার্চ ফিল্টারিং
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Package className="text-blue-600" /> Inventory Management
          </h1>
          <p className="text-sm text-slate-500">
            Total {products.length} products available
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 active:scale-95"
        >
          <Plus size={20} /> Add New Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#0f1419] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-[#0f1419] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Product Info
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Price & Reward
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2
                        className="animate-spin text-blue-600"
                        size={40}
                      />
                      <p className="text-sm text-slate-500 font-medium">
                        Fetching inventory...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-700">
                          <img
                            src={p.image || "/placeholder-product.png"}
                            alt={p.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">
                            Stock: {p.stock || 0}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                        {p.category_name || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black text-slate-800 dark:text-white">
                        ৳{Math.floor(p.price)}
                      </div>
                      <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {p.point_value} PV REWARD
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                          title="Edit Product"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          title="Delete Product"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <Package size={48} />
                      <p className="font-bold">
                        No products found matching your search
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <AddProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            loadProducts();
            toast.success("New product added to inventory");
          }}
        />
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            loadProducts();
            toast.success("Product updated successfully");
          }}
          product={selectedProduct}
        />
      )}
    </div>
  );
}

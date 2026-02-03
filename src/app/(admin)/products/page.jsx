"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, Package, Search, Loader2 } from "lucide-react";
import { getAllProducts, deleteProduct } from "@/services/productService";
import AddProductModal from "../components/AddProductModal";
import EditProductModal from "../components/EditProductModal"; // নতুন ইমপোর্ট

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // এডিট স্টেট
  const [selectedProduct, setSelectedProduct] = useState(null); // সিলেক্টেড প্রোডাক্ট
  const [searchTerm, setSearchTerm] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await getAllProducts();
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        setProducts(products.filter((p) => p.id !== id));
      } catch (err) {
        alert("Failed to delete product");
      }
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Package className="text-blue-600" /> Inventory Management
          </h1>
          <p className="text-sm text-slate-500">Add, edit or remove products</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus size={20} /> Add New Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#0f1419] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#0f1419] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                  Product Info
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                  Category
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">
                  Price & PV
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center">
                    <Loader2
                      className="animate-spin mx-auto text-blue-600"
                      size={32}
                    />
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <span className="font-bold">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {p.category_name || "General"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-blue-600">${p.price}</div>
                      <div className="text-[10px] text-emerald-500 uppercase">
                        {p.point_value} PV
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-2 text-slate-400 hover:text-blue-600 transition"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition"
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
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={loadProducts}
          product={selectedProduct}
        />
      )}
    </div>
  );
}

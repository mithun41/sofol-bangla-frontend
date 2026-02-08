"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, FolderEdit, FolderPlus, Loader2 } from "lucide-react";
import { getAllCategories, deleteCategory } from "@/services/productService";
import CategoryModal from "../components/CategoryModal";

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, category: null });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await getAllCategories();
      setCategories(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderEdit className="text-blue-600" /> Categories
          </h1>
          <p className="text-sm text-slate-500">
            Manage your product categories with images
          </p>
        </div>
        <button
          onClick={() => setModal({ isOpen: true, category: null })}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200"
        >
          <Plus size={20} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-600" />
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white dark:bg-[#0f1419] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-hover hover:shadow-md"
            >
              {/* Category Image Preview */}
              <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <FolderPlus size={24} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base truncate">{cat.name}</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold italic">
                  Slug: {cat.slug}
                </p>
              </div>

              <button
                onClick={() => setModal({ isOpen: true, category: cat })}
                className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:text-blue-600 transition"
              >
                <FolderEdit size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {modal.isOpen && (
        <CategoryModal
          isOpen={modal.isOpen}
          category={modal.category}
          onClose={() => setModal({ isOpen: false, category: null })}
          onSuccess={loadCategories}
        />
      )}
    </div>
  );
}

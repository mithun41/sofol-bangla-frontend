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
            Manage your product categories
          </p>
        </div>
        <button
          onClick={() => setModal({ isOpen: true, category: null })}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"
        >
          <Plus size={20} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <Loader2 className="animate-spin text-blue-600" />
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white dark:bg-[#0f1419] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold text-lg">{cat.name}</h3>
                <p className="text-xs text-slate-400">Slug: {cat.slug}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setModal({ isOpen: true, category: cat })}
                  className="p-2 text-slate-400 hover:text-blue-600 transition"
                >
                  <FolderEdit size={18} />
                </button>
              </div>
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

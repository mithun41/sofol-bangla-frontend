"use client";
import { useState } from "react";
import { X, CheckCircle2, Loader2 } from "lucide-react";
import api from "@/services/api"; // সরাসরি এপিআই বা সার্ভিস ব্যবহার করুন

export default function CategoryModal({
  isOpen,
  onClose,
  onSuccess,
  category,
}) {
  const [name, setName] = useState(category?.name || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (category) {
        // Edit Category
        await api.patch(`products/categories/${category.id}/`, { name });
      } else {
        // Add Category
        await api.post("products/categories/", { name });
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert("Error saving category. Slug might already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f1419] w-full max-w-md rounded-3xl shadow-2xl border dark:border-slate-800">
        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {category ? "Edit" : "Add"} Category
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Electronics"
              className="w-full p-4 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <CheckCircle2 size={20} />
            )}
            {category ? "Update Category" : "Create Category"}
          </button>
        </form>
      </div>
    </div>
  );
}

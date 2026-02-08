"use client";
import { useState, useEffect, useRef } from "react";
import { X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { createCategory, updateCategory } from "@/services/productService";
import toast from "react-hot-toast";

export default function CategoryModal({
  isOpen,
  category,
  onClose,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", slug: "", image: null });
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (category) {
      setFormData({ name: category.name, slug: category.slug, image: null });
      setPreview(category.image); // আগের ইমেজ দেখাবে
    } else {
      setFormData({ name: "", slug: "", image: null });
      setPreview(null);
    }
  }, [category]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file)); // লোকাল প্রিভিউ তৈরি
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("slug", formData.slug);
    if (formData.image) {
      data.append("image", formData.image); // ফাইল যোগ করা হচ্ছে
    }

    try {
      if (category) {
        await updateCategory(category.id, data);
        toast.success("Category updated!");
      } else {
        await createCategory(data);
        toast.success("Category created!");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0f1419] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold">
            {category ? "Edit Category" : "Add New Category"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Custom Image Upload UI */}
          <div className="flex flex-col items-center">
            <div
              onClick={() => fileInputRef.current.click()}
              className="relative w-32 h-32 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:border-blue-500 transition-all overflow-hidden bg-slate-50 dark:bg-slate-800/50"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <ImageIcon size={32} strokeWidth={1.5} />
                  <span className="text-[10px] font-bold mt-2 uppercase tracking-widest">
                    Select Image
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                <Upload size={20} className="text-white" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                Category Name
              </label>
              <input
                type="text"
                required
                className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Organic Food"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                Slug
              </label>
              <input
                type="text"
                required
                className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-500"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: e.target.value.toLowerCase().replace(/ /g, "-"),
                  })
                }
                placeholder="organic-food"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-blue-200 dark:shadow-none"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : category ? (
              "Update Category"
            ) : (
              "Create Category"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import {
  getAllCategories,
  createCategory,
  updateCategory,
} from "@/services/productService";
import toast from "react-hot-toast";

export default function CategoryModal({
  isOpen,
  category,
  onClose,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parent: "", // সাব-ক্যাটাগরির জন্য প্যারেন্ট আইডি
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mainCategories, setMainCategories] = useState([]);

  useEffect(() => {
    // মেইন ক্যাটাগরিগুলো লোড করা (ড্রপডাউনের জন্য)
    const fetchMainCats = async () => {
      const res = await getAllCategories();
      // শুধু মেইন ক্যাটাগরিগুলো ফিল্টার করছি (যাদের প্যারেন্ট নাই)
      // এবং এডিট করার সময় যেন নিজেকে নিজে প্যারেন্ট হিসেবে না দেখে
      const filtered = res.data.filter(
        (cat) => !cat.parent && cat.id !== category?.id,
      );
      setMainCategories(filtered);
    };
    fetchMainCats();

    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        parent: category.parent || "",
      });
      setPreview(category.image);
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("slug", formData.slug);
    if (formData.parent) data.append("parent", formData.parent);
    if (image) data.append("image", image);

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
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#0f1419] w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {category ? "Edit" : "Add"} Category
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Parent Category Selection */}
          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-slate-500">
              Parent Category (Optional)
            </label>
            <select
              value={formData.parent}
              onChange={(e) =>
                setFormData({ ...formData, parent: e.target.value })
              }
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None (Main Category)</option>
              {mainCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-slate-500">
              Category Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Electronics"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Image Upload UI (আগের মতোই) */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border">
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" />
              ) : (
                <Upload className="m-auto mt-6 text-slate-300" />
              )}
            </div>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                setImage(file);
                setPreview(URL.createObjectURL(file));
              }}
              className="text-xs"
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : category ? (
              "Update"
            ) : (
              "Create"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

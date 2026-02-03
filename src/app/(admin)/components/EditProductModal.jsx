"use client";
import { useState, useEffect } from "react";
import { X, CheckCircle2, Loader2, Upload } from "lucide-react";
import { getAllCategories, updateProduct } from "@/services/productService";

export default function EditProductModal({
  isOpen,
  onClose,
  onSuccess,
  product,
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || "",
    category: product?.category || "",
    price: product?.price || "",
    point_value: product?.point_value || "",
    stock: product?.stock || "",
    description: product?.description || "",
    image: null,
  });

  useEffect(() => {
    getAllCategories().then((res) => setCategories(res.data));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("category", formData.category);
    data.append("price", formData.price);
    data.append("point_value", formData.point_value);
    data.append("stock", formData.stock);
    data.append("description", formData.description);

    // শুধুমাত্র নতুন ফটো সিলেক্ট করলেই সেটি পাঠাবে
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      await updateProduct(product.id, data);
      onSuccess();
      onClose();
    } catch (err) {
      alert("Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f1419] w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-y-auto max-h-[90vh] border border-slate-200 dark:border-slate-800">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-[#0f1419] z-10">
          <h2 className="text-xl font-bold dark:text-white">
            Edit Product: {product.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5 block">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5 block">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                rows="3"
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5 block">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5 block">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5 block">
                Price ($)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none font-bold text-blue-600"
                required
              />
            </div>

            {/* PV Points */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5 block">
                PV Points
              </label>
              <input
                type="number"
                name="point_value"
                value={formData.point_value}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none font-bold text-emerald-500"
                required
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5 block">
              Change Image (Optional)
            </label>
            <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center group hover:border-blue-500 transition-all">
              <input
                type="file"
                name="image"
                onChange={handleChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-blue-500">
                <Upload size={24} />
                <span className="text-sm font-medium">
                  {formData.image
                    ? formData.image.name
                    : "Select new photo to replace current one"}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <CheckCircle2 size={20} />
            )}
            {loading ? "Saving Changes..." : "Update Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

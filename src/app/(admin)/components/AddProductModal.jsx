"use client";
import { useState, useEffect } from "react";
import { X, Upload, CheckCircle2, Loader2 } from "lucide-react"; // Loader2 এখানে যোগ করা হয়েছে
import { getAllCategories, createProduct } from "@/services/productService";

export default function AddProductModal({ isOpen, onClose, onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    point_value: "",
    stock: "",
    description: "", // ডেসক্রিপশন ফিল্ড
    image: null,
  });

  useEffect(() => {
    getAllCategories().then((res) => setCategories(res.data));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) data.append(key, formData[key]);
    });

    try {
      await createProduct(data);
      onSuccess();
      onClose();
    } catch (err) {
      alert("Error creating product. Check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f1419] w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-y-auto max-h-[90vh] border border-slate-200 dark:border-slate-800">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-[#0f1419] z-10">
          <h2 className="text-xl font-bold dark:text-white">
            Add Premium Product
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
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5 block">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product name"
              />
            </div>

            {/* Description Field Added Here */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5 block">
                Description
              </label>
              <textarea
                name="description"
                rows="3"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write product details..."
              ></textarea>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5 block">
                Category
              </label>
              <select
                name="category"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5 block">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5 block">
                Price ($)
              </label>
              <input
                type="number"
                name="price"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5 block">
                PV Points
              </label>
              <input
                type="number"
                name="point_value"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5 block">
              Product Image
            </label>
            <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center">
              <input
                type="file"
                name="image"
                required
                onChange={handleChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <Upload size={24} />
                <span className="text-sm">
                  {formData.image ? formData.image.name : "Upload Image"}
                </span>
              </div>
            </div>
          </div>

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
            {loading ? "Publishing..." : "Publish Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

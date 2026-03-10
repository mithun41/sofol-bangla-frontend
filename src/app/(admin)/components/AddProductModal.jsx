"use client";
import { useState, useEffect } from "react";
import { X, Upload, CheckCircle2, Loader2, Banknote, Tag } from "lucide-react";
import { createProduct, getAllCategories } from "@/services/productService";

export default function AddProductModal({ isOpen, onClose, onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    purchase_price: "", // কেনা দাম
    price: "", // বিক্রি দাম
    stock: "",
    description: "",
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

  // লাইভ পয়েন্ট ক্যালকুলেশন লজিক: (বিক্রি দাম - কেনা দাম) / 4
  const calculatedPV = () => {
    const buy = parseFloat(formData.purchase_price) || 0;
    const sell = parseFloat(formData.price) || 0;
    const profit = sell - buy;
    return profit > 0 ? (profit / 4).toFixed(2) : "0.00";
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
      <div className="bg-white dark:bg-[#0f1419] w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-y-auto max-h-[95vh] border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-[#0f1419] z-10">
          <div>
            <h2 className="text-xl font-bold dark:text-white">
              Add New Product
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Point Value (PV) will be calculated automatically
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Product Name */}
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Ex: Organic Green Tea"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
                Category
              </label>
              <select
                name="category"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="0"
              />
            </div>

            {/* Purchase Price */}
            <div className="relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
                Purchase Price (৳)
              </label>
              <div className="relative">
                <Banknote
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="number"
                  name="purchase_price"
                  required
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                  placeholder="Buying price"
                />
              </div>
            </div>

            {/* Selling Price */}
            <div className="relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
                Selling Price (৳)
              </label>
              <div className="relative">
                <Tag
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="number"
                  name="price"
                  required
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  placeholder="Selling price"
                />
              </div>
            </div>

            {/* PV Points Display (Automatic) */}
            <div className="md:col-span-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  Calculated Reward
                </p>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                  Point Value (PV)
                </p>
              </div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {calculatedPV()}
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
                Product Description
              </label>
              <textarea
                name="description"
                rows="3"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Write detailed product information..."
              ></textarea>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
              Product Image
            </label>
            <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors group">
              <input
                type="file"
                name="image"
                required
                onChange={handleChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
              />
              <div className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-blue-500 transition-colors">
                <Upload size={32} strokeWidth={1.5} />
                <span className="text-sm font-medium">
                  {formData.image
                    ? formData.image.name
                    : "Drop image here or click to upload"}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-200 dark:shadow-blue-900/20"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <CheckCircle2 size={22} />
            )}
            {loading ? "Creating Product..." : "Confirm & Publish Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

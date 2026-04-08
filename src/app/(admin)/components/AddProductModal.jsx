"use client";
import { useState, useEffect } from "react";
import {
  X,
  Upload,
  CheckCircle2,
  Loader2,
  Banknote,
  Tag,
  Trash2,
  Layers,
} from "lucide-react";
import { createProduct, getAllCategories } from "@/services/productService";

export default function AddProductModal({ isOpen, onClose, onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    unit_type: "piece", // ডিফল্ট 'piece' সেট করা হলো
    purchase_price: "",
    price: "",
    stock: "",
    description: "",
    image: null,
  });

  useEffect(() => {
    getAllCategories().then((res) => {
      const data = Array.isArray(res.data) ? res.data : res.data.results;
      setCategories(data || []);
    });
  }, []);

  const calculatePVValue = () => {
    const buy = parseFloat(formData.purchase_price) || 0;
    const sell = parseFloat(formData.price) || 0;
    const profit = sell - buy;
    return profit > 0 ? (profit / 4).toFixed(2) : "0.00";
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files[0]) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) data.append(key, formData[key]);
    });
    data.append("point_value", Math.round(calculatePVValue()));

    try {
      await createProduct(data);
      onSuccess();
      onClose();
    } catch (err) {
      alert("Error creating product!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
              Select correct unit type for stock management
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

            {/* ✅ Unit Type (নতুন যোগ করা হলো) */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
                Unit Type
              </label>
              <select
                name="unit_type"
                required
                onChange={handleChange}
                defaultValue="piece"
                className="w-full px-4 py-3 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none font-bold"
              >
                <option value="piece">Piece (pcs)</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="gram">Gram (g)</option>
                <option value="liter">Liter (L)</option>
              </select>
            </div>

            {/* Stock */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
                Initial Stock
              </label>
              <input
                type="number"
                step="0.001"
                name="stock"
                required
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-blue-600"
                placeholder="0.00"
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

            {/* Selling Price & PV Display (বাকি অংশ আগের মতোই) */}
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
                {calculatePVValue()}
              </div>
            </div>
          </div>

          {/* Description & Image Preview (আগের কোড অনুযায়ী থাকবে) */}
          <div className="md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
              Product Description
            </label>
            <textarea
              name="description"
              rows="2"
              required
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Short description..."
            ></textarea>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
              Product Image
            </label>
            {!preview ? (
              <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-blue-400 group cursor-pointer transition-all">
                <input
                  type="file"
                  name="image"
                  required
                  onChange={handleChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                />
                <Upload
                  className="mx-auto text-slate-400 group-hover:text-blue-500 mb-2"
                  size={32}
                />
                <span className="text-sm font-medium text-slate-500">
                  Upload Photo
                </span>
              </div>
            ) : (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden group">
                <img
                  src={preview}
                  className="w-full h-full object-cover"
                  alt="preview"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setFormData((p) => ({ ...p, image: null }));
                  }}
                  className="absolute top-4 right-4 bg-rose-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl transition-all"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <CheckCircle2 size={22} />
            )}
            {loading ? "Publishing..." : "Confirm & Publish Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

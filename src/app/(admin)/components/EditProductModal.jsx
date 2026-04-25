"use client";
import { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  Loader2,
  Upload,
  Banknote,
  Tag,
  Layers,
  Barcode,
} from "lucide-react";
import { getAllCategories, updateProduct } from "@/services/productService";
import toast from "react-hot-toast";

export default function EditProductModal({
  isOpen,
  onClose,
  onSuccess,
  product,
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(product?.image || null);
  const [formData, setFormData] = useState({
    name: product?.name || "",
    category: product?.category || "",
    purchase_price: product?.purchase_price || "",
    price: product?.price || "",
    stock: product?.stock || "",
    unit_type: product?.unit_type || "piece",
    barcode_number: product?.barcode_number || "",
    description: product?.description || "",
    image: null,
  });

  const unitTypes = [
    { label: "Piece", value: "piece" },
    { label: "KG", value: "kg" },
  ];

  useEffect(() => {
    getAllCategories().then((res) => {
      const data = Array.isArray(res.data) ? res.data : res.data.results;
      setCategories(data || []);
    });
  }, []);

const handleChange = (e) => {
  const { name, value, files } = e.target;

  if (files && files[0]) {
    const file = files[0];

    setFormData((prev) => ({
      ...prev,
      [name]: file,
    }));

    setPreview(URL.createObjectURL(file));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};
useEffect(() => {
  if (product) {
    setFormData({
      name: product?.name || "",
      category: product?.category || "",
      purchase_price: product?.purchase_price || "",
      price: product?.price || "",
      stock: product?.stock || "",
      unit_type: product?.unit_type || "piece",
      barcode_number: product?.barcode_number || "",
      description: product?.description || "",
      image: null,
    });

    setPreview(product?.image || null);
  }
}, [product]);
  // PV ক্যালকুলেশন যা সরাসরি দশমিক মান রিটার্ন করবে
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
    data.append("name", formData.name);
    data.append("category", formData.category);
    data.append("purchase_price", formData.purchase_price);
    data.append("price", formData.price);
    data.append("stock", formData.stock);
    data.append("unit_type", formData.unit_type);
    data.append("barcode_number", formData.barcode_number);
    data.append("description", formData.description);

    /** * ফিক্সড: Math.round() রিমুভ করা হয়েছে।
     * এখন calculatedPV() থেকে সরাসরি ১.৭৫ বা দশমিক মান যাবে।
     */
    data.append("point_value", calculatedPV());

    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      await updateProduct(product.id, data);
      onSuccess();
      onClose();
      toast.success("Product updated successfully!");
    } catch (err) {
      toast.error("Update failed. Please try again.");
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
            <h2 className="text-xl font-bold dark:text-white line-clamp-1">
              Edit: {product.name}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Updating inventory and unit specifications
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
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Barcode Number */}
            <div className="md:col-span-2 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
                Update Barcode (Scan or Type)
              </label>
              <div className="relative">
                <Barcode
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  name="barcode_number"
                  value={formData.barcode_number}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                  placeholder="Scan new barcode or keep existing..."
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Type */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
                Quantity Type (Unit)
              </label>
              <div className="relative">
                <Layers
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <select
                  name="unit_type"
                  value={formData.unit_type}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  {unitTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stock */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
                Stock Quantity
              </label>
              <input
                type="number"
                step="0.001"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Purchase Price */}
            <div>
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
                  value={formData.purchase_price}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Selling Price */}
            <div>
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
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>
            </div>

            {/* PV Info Box */}
            <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  New Calculated PV
                </p>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  Based on profit / 4
                </p>
              </div>
              <div className="text-2xl font-black text-blue-600">
                {calculatedPV()} <span className="text-xs">PV</span>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                rows="2"
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-2xl border dark:bg-slate-800 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {/* Product Image Edit */}
          <div className="md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5 block">
              Product Image
            </label>

            {!preview ? (
              <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-blue-400 group cursor-pointer transition-all">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                />

                <Upload
                  className="mx-auto text-slate-400 group-hover:text-blue-500 mb-2"
                  size={32}
                />

                <span className="text-sm font-medium text-slate-500">
                  Upload Product Image
                </span>
              </div>
            ) : (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden group border">
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                  <label className="bg-white text-slate-800 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer">
                    Change Image
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleChange}
                      hidden
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      setFormData((prev) => ({
                        ...prev,
                        image: null,
                      }));
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <CheckCircle2 size={20} />
            )}
            {loading ? "Updating Product..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

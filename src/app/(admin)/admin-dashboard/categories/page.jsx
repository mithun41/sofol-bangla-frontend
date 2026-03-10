"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  FolderEdit,
  FolderPlus,
  Loader2,
  Subtitles,
} from "lucide-react";
import {
  getAllCategories,
  deleteCategory,
  getAllCategorie,
} from "@/services/productService";
import CategoryModal from "../../components/CategoryModal";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

// ১. সাব-ক্যাটাগরি এবং মেইন ক্যাটাগরি রেন্ডার করার জন্য কমন কার্ড কম্পোনেন্ট
const CategoryCard = ({ cat, onEdit, onDelete }) => {
  const isSub = !!cat.parent; // যদি প্যারেন্ট থাকে তবে এটি সাব-ক্যাটাগরি

  return (
    <div
      className={`bg-white dark:bg-[#0f1419] p-4 rounded-3xl border transition-all hover:shadow-xl hover:-translate-y-1 group flex items-center gap-4 ${
        isSub
          ? "border-blue-100 bg-blue-50/30 ml-0 md:ml-4 shadow-sm"
          : "border-slate-100 dark:border-slate-800 shadow-md"
      }`}
    >
      {/* ইমেজ সেকশন */}
      <div
        className={`w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border ${
          isSub ? "border-blue-200" : "border-slate-100 dark:border-slate-700"
        }`}
      >
        {cat.image ? (
          <img
            src={cat.image}
            alt={cat.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
            <FolderPlus size={24} />
          </div>
        )}
      </div>

      {/* টেক্সট সেকশন */}
      <div className="flex-1 min-w-0">
        <h3
          className={`font-bold text-base truncate ${isSub ? "text-blue-900" : "text-slate-800 dark:text-slate-200"}`}
        >
          {cat.name}
        </h3>
        {cat.parent_name ? (
          <p className="text-[10px] text-blue-500 font-black uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            Sub of: {cat.parent_name}
          </p>
        ) : (
          <p className="text-[10px] text-slate-400 uppercase font-black italic tracking-widest">
            Main Category
          </p>
        )}
      </div>

      {/* অ্যাকশন বাটন */}
      <div className="flex flex-col gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(cat)}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
        >
          <FolderEdit size={18} />
        </button>
        <button
          onClick={() => onDelete(cat.id)}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, category: null });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await getAllCategorie();
      // আপনার নতুন API অনুযায়ী এখানে মেইন ক্যাটাগরিগুলো (যাদের ভেতরে subcategories আছে) আসবে
      setCategories(res.data);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this! Products in this category will be uncategorized.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      customClass: {
        popup: "rounded-[2rem]",
        confirmButton: "rounded-xl px-6 py-2.5 font-bold",
        cancelButton: "rounded-xl px-6 py-2.5 font-bold",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const loadingToast = toast.loading("Deleting category...");
        try {
          await deleteCategory(id);
          // ডিলিট করার পর লিস্ট রিফ্রেশ করা ভালো কারণ নেস্টেড ডাটা ফিল্টার করা জটিল
          loadCategories();
          toast.success("Category deleted successfully", { id: loadingToast });

          Swal.fire({
            title: "Deleted!",
            icon: "success",
            timer: 1000,
            showConfirmButton: false,
            customClass: { popup: "rounded-[2rem]" },
          });
        } catch (err) {
          toast.error("Failed to delete category", { id: loadingToast });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
            <FolderEdit className="text-blue-600" /> Manage Categories
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Total {categories.length} main categories found
          </p>
        </div>
        <button
          onClick={() => setModal({ isOpen: true, category: null })}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-100 transition-all active:scale-95 text-xs"
        >
          <Plus size={18} /> Add New
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">
              Fetching Data...
            </p>
          </div>
        ) : categories.length > 0 ? (
          categories.map((mainCat) => (
            <React.Fragment key={mainCat.id}>
              {/* মেইন ক্যাটাগরি রেন্ডার */}
              <CategoryCard
                cat={mainCat}
                onEdit={(c) => setModal({ isOpen: true, category: c })}
                onDelete={handleDelete}
              />

              {/* ২. সাব-ক্যাটাগরি রেন্ডার (যদি থাকে) */}
              {mainCat.subcategories &&
                mainCat.subcategories.map((sub) => (
                  <CategoryCard
                    key={sub.id}
                    cat={sub}
                    onEdit={(c) => setModal({ isOpen: true, category: c })}
                    onDelete={handleDelete}
                  />
                ))}
            </React.Fragment>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
            <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">
              No categories found in database
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
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

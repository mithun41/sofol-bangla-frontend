"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, FolderEdit, FolderPlus, Loader2 } from "lucide-react";
import { getAllCategories, deleteCategory } from "@/services/productService";
import CategoryModal from "../components/CategoryModal";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2"; // SweetAlert2 ইম্পোর্ট করলাম

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, category: null });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await getAllCategories();
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

  // --- SweetAlert2 ডিলিট হ্যান্ডলার ---
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this! It might affect products in this category.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#fff",
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
          setCategories(categories.filter((cat) => cat.id !== id));
          toast.success("Category deleted successfully", { id: loadingToast });

          // ডিলিট হওয়ার পর একটি সাকসেস অ্যালার্ট (ঐচ্ছিক)
          Swal.fire({
            title: "Deleted!",
            text: "The category has been removed.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            customClass: { popup: "rounded-[2rem]" },
          });
        } catch (err) {
          toast.error("Failed to delete category", { id: loadingToast });
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderEdit className="text-blue-600" /> Categories
          </h1>
          <p className="text-sm text-slate-500">
            Manage your product categories with images
          </p>
        </div>
        <button
          onClick={() => setModal({ isOpen: true, category: null })}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus size={20} /> Add Category
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="text-slate-400 font-medium">Loading categories...</p>
          </div>
        ) : categories.length > 0 ? (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white dark:bg-[#0f1419] p-4 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 transition-all hover:shadow-xl hover:-translate-y-1 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-100 dark:border-slate-700">
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <FolderPlus size={24} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 truncate">
                  {cat.name}
                </h3>
                {cat.parent_name ? (
                  <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">
                    Sub-category of: {cat.parent_name}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 uppercase font-black italic tracking-widest">
                    Main Category
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setModal({ isOpen: true, category: cat })}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <FolderEdit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">
              No categories available
            </p>
          </div>
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

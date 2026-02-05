"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getAllProducts, getAllCategories } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

export default function ShopPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart, cart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const isActiveMember = user?.status === "active";

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          getAllProducts(),
          getAllCategories(),
        ]);

        const allProducts = Array.isArray(prodRes.data)
          ? prodRes.data
          : prodRes.data.results;

        setProducts(allProducts || []);
        setCategories(catRes.data || []);
      } catch (err) {
        console.error("Data loading failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ফিল্টার চেঞ্জ হলে পেজ ১-এ নিয়ে আসা
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, minPrice, maxPrice]);

  const handleAddToCartWithToast = (p) => {
    const originalPrice = Number(p.price || 0);
    const pointValue = Number(p.point_value || 0);
    const finalPrice = isActiveMember
      ? originalPrice - pointValue
      : originalPrice;

    const cartItem = {
      ...p,
      price: finalPrice,
      point_value: isActiveMember ? 0 : pointValue,
      quantity: 1,
    };

    addToCart(cartItem);
    toast.success(
      <div className="flex flex-col">
        <span className="font-bold">{p.name} added!</span>
        <span className="text-xs">Final Price: ৳{finalPrice}</span>
      </div>,
      {
        position: "top-center",
        style: { borderRadius: "12px", background: "#10b981", color: "#fff" },
      },
    );
  };

  const handleOrderNow = (p) => {
    handleAddToCartWithToast(p);
    router.push("/cart");
  };

  // --- Filter Logic ---
  const filteredProducts = products.filter((p) => {
    const productPrice = Number(p.price || 0);
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || p.category === parseInt(selectedCategory);
    const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const FilterPanel = ({ isMobile = false }) => (
    <div className={`${isMobile ? "p-6" : ""}`}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <SlidersHorizontal size={20} /> Filters
            </h3>
            {isMobile && (
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <div className="mb-8">
            <label className="text-sm font-semibold mb-4 block">
              Categories
            </label>
            <div className="space-y-1.5">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedCategory === "All" ? "bg-emerald-500 text-white" : "bg-slate-50 dark:bg-slate-800"}`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${selectedCategory === cat.id ? "bg-emerald-500 text-white" : "bg-slate-50 dark:bg-slate-800"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-semibold mb-4 block">
              Price: ৳{minPrice} - ৳{maxPrice}
            </label>
            <div className="space-y-4">
              <input
                type="range"
                min="0"
                max="50000"
                step="50"
                value={minPrice}
                onChange={(e) =>
                  setMinPrice(Math.min(Number(e.target.value), maxPrice - 50))
                }
                className="w-full accent-emerald-500"
              />
              <input
                type="range"
                min="0"
                max="50000"
                step="50"
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(Math.max(Number(e.target.value), minPrice + 50))
                }
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
              setMinPrice(0);
              setMaxPrice(50000);
            }}
            className="w-full mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:text-red-500 rounded-lg font-bold text-xs transition-all"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 relative">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 outline-none text-sm"
            />
          </div>
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 text-sm font-bold shadow-sm"
          >
            <SlidersHorizontal size={18} /> Filters
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-6">
              <FilterPanel />
            </div>
          </aside>

          <main className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
              </div>
            ) : currentItems.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {currentItems.map((p) => {
                    const discountAmount = Number(p.point_value || 0);
                    const finalPrice = isActiveMember
                      ? Number(p.price) - discountAmount
                      : Number(p.price);

                    return (
                      <div
                        key={p.id}
                        className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden group hover:shadow-md transition-all flex flex-col relative"
                      >
                        {/* Card Content (Image, Price, Buttons) - Samne code er motoi thakbe */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                          <Link
                            href={`/shop/${p.id}`}
                            className="block w-full h-full"
                          >
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </Link>
                          <div className="absolute top-2 left-2">
                            {isActiveMember
                              ? discountAmount > 0 && (
                                  <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                    ৳{discountAmount} OFF
                                  </span>
                                )
                              : p.point_value > 0 && (
                                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                    +{p.point_value} PV
                                  </span>
                                )}
                          </div>
                          <button
                            onClick={() => handleAddToCartWithToast(p)}
                            className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-emerald-600 shadow hover:bg-emerald-600 hover:text-white transition-all z-10"
                          >
                            <ShoppingCart size={16} />
                          </button>
                        </div>
                        <div className="p-3 flex-1 flex flex-col">
                          <Link href={`/shop/${p.id}`}>
                            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 line-clamp-1">
                              {p.name}
                            </h3>
                          </Link>
                          <div className="flex items-baseline gap-1.5 mb-3">
                            <span className="text-sm font-black text-emerald-600">
                              ৳{Math.floor(finalPrice)}
                            </span>
                            {isActiveMember && discountAmount > 0 && (
                              <span className="text-[10px] text-slate-400 line-through">
                                ৳{Math.floor(p.price)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => p.stock > 0 && handleOrderNow(p)}
                            className={`w-full block text-center py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all mt-auto ${p.stock > 0 ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                          >
                            {p.stock > 0 ? "Order Now" : "Out of Stock"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* --- Pagination UI --- */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-50 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`w-10 h-10 rounded-lg border font-bold text-sm transition-all ${currentPage === index + 1 ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200" : "bg-white border-slate-200 text-slate-600 hover:border-emerald-500"}`}
                      >
                        {index + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-slate-200 bg-white disabled:opacity-50 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-500 font-medium">No products found.</p>
              </div>
            )}
          </main>
        </div>
      </div>
      {/* Floating Cart & Mobile Filter same as before */}
      <Link
        href="/cart"
        className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-emerald-600 text-white px-6 py-4 rounded-full shadow-2xl hover:scale-105 transition-all"
      >
        <ShoppingCart size={24} />
        {cart?.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-white text-emerald-600 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {cart.length}
          </span>
        )}
      </Link>
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-right">
            <FilterPanel isMobile />
          </div>
        </div>
      )}
    </div>
  );
}

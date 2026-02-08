"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ShoppingCart,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { getAllProducts, getAllCategories } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const catQuery = searchParams.get("category"); // স্লাইডার থেকে আসা ক্যাটাগরি আইডি

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

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const isActiveMember = user?.status === "active";

  // ১. স্লাইডার থেকে আইডি আসলে সেটা অটো সিলেক্ট করা
  useEffect(() => {
    if (catQuery) {
      setSelectedCategory(Number(catQuery));
    } else {
      setSelectedCategory("All");
    }
  }, [catQuery]);

  // ২. এপিআই থেকে ডেটা লোড করা
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
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
        toast.error("Failed to load data");
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
      <div className="flex flex-col text-xs font-bold">
        <span>{p.name} added!</span>
        <span>Price: ৳{finalPrice}</span>
      </div>,
      {
        position: "top-center",
        style: { borderRadius: "10px", background: "#10b981", color: "#fff" },
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

    // ক্যাটাগরি ফিল্টার: String/Number দুইটাই হ্যান্ডেল করা হয়েছে
    const matchesCategory =
      selectedCategory === "All" ||
      Number(p.category) === Number(selectedCategory);

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
            <h3 className="text-lg font-bold flex items-center gap-2 uppercase tracking-tighter">
              <SlidersHorizontal size={20} className="text-emerald-500" />{" "}
              Filters
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
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">
              Categories
            </label>
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  router.push("/shop");
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${selectedCategory === "All" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100"}`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    router.push(`/shop?category=${cat.id}`);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${Number(selectedCategory) === cat.id ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">
              Price Range: ৳{minPrice} - ৳{maxPrice}
            </label>
            <div className="space-y-4 px-1">
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={minPrice}
                onChange={(e) =>
                  setMinPrice(Math.min(Number(e.target.value), maxPrice - 100))
                }
                className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max="50000"
                step="500"
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(Math.max(Number(e.target.value), minPrice + 100))
                }
                className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
              setMinPrice(0);
              setMaxPrice(50000);
              router.push("/shop");
            }}
            className="w-full mt-4 px-4 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 relative">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search premium products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 outline-none text-sm font-medium shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 text-sm font-black shadow-sm uppercase tracking-tighter"
          >
            <SlidersHorizontal size={18} /> Filters
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28">
              <FilterPanel />
            </div>
          </aside>

          <main className="lg:col-span-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  Loading Products...
                </p>
              </div>
            ) : currentItems.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {currentItems.map((p) => {
                    const discountAmount = Number(p.point_value || 0);
                    const finalPrice = isActiveMember
                      ? Number(p.price) - discountAmount
                      : Number(p.price);

                    return (
                      <div
                        key={p.id}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                      >
                        <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
                          <Link
                            href={`/shop/${p.id}`}
                            className="block w-full h-full"
                          >
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          </Link>
                          <div className="absolute top-3 left-3 flex flex-col gap-1">
                            {isActiveMember
                              ? discountAmount > 0 && (
                                  <span className="bg-orange-500 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase shadow-lg shadow-orange-200/50 italic">
                                    ৳{discountAmount} OFF
                                  </span>
                                )
                              : p.point_value > 0 && (
                                  <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase shadow-lg shadow-emerald-200/50">
                                    +{p.point_value} PV
                                  </span>
                                )}
                          </div>
                          <button
                            onClick={() => handleAddToCartWithToast(p)}
                            className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-md dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-600 shadow-xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 z-10 hover:bg-emerald-600 hover:text-white"
                          >
                            <ShoppingCart size={18} />
                          </button>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <Link href={`/shop/${p.id}`}>
                            <h3 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 line-clamp-2 leading-relaxed group-hover:text-emerald-600 transition-colors tracking-tight">
                              {p.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm md:text-lg font-black text-emerald-600 tracking-tight">
                              ৳{Math.floor(finalPrice)}
                            </span>
                            {isActiveMember && discountAmount > 0 && (
                              <span className="text-[10px] text-slate-400 line-through font-bold">
                                ৳{Math.floor(p.price)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => p.stock > 0 && handleOrderNow(p)}
                            className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mt-auto ${p.stock > 0 ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 active:scale-95" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                          >
                            {p.stock > 0 ? "Buy Now" : "Sold Out"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-16 mb-10 flex justify-center items-center gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-11 h-11 flex items-center justify-center rounded-xl border border-slate-200 bg-white disabled:opacity-30 hover:bg-emerald-50 transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx + 1}
                        onClick={() => paginate(idx + 1)}
                        className={`w-11 h-11 rounded-xl border font-black text-xs transition-all ${currentPage === idx + 1 ? "bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-100" : "bg-white border-slate-200 text-slate-600 hover:border-emerald-500"}`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="w-11 h-11 flex items-center justify-center rounded-xl border border-slate-200 bg-white disabled:opacity-30 hover:bg-emerald-50 transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="text-slate-300" size={32} />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                  No products found in this criteria.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
      {/* Floating Cart & Mobile Filter Wrapper */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-right duration-500">
            <FilterPanel isMobile />
          </div>
        </div>
      )}
    </div>
  );
}

// Main Export with Suspense
export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-emerald-500" size={40} />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}

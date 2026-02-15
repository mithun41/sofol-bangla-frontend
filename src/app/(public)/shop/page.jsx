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
  ChevronDown,
} from "lucide-react";
import { getAllProducts, getAllCategories } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const catQuery = searchParams.get("category");

  const { user } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [expandedCats, setExpandedCats] = useState({});

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const isActiveMember = user?.status === "active";

  useEffect(() => {
    if (catQuery) {
      setSelectedCategory(Number(catQuery));
    } else {
      setSelectedCategory("All");
    }
  }, [catQuery]);

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
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, minPrice, maxPrice]);

  const toggleExpand = (e, id) => {
    e.stopPropagation();
    setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
    toast.success(`${p.name} added!`, { position: "top-center" });
  };

  const filteredProducts = products.filter((p) => {
    const productPrice = Number(p.price || 0);
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      Number(p.category) === Number(selectedCategory);
    const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;
    return matchesSearch && matchesCategory && matchesPrice;
  });

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

          {/* Categories with Sub-category Support */}
          <div className="mb-8">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">
              Categories
            </label>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  router.push("/shop");
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${selectedCategory === "All" ? "bg-emerald-500 text-white shadow-lg" : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100"}`}
              >
                All Products
              </button>

              {categories
                .filter((c) => !c.parent)
                .map((cat) => (
                  <div key={cat.id} className="space-y-1">
                    <div
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        router.push(`/shop?category=${cat.id}`);
                      }}
                      className={`group flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${Number(selectedCategory) === cat.id ? "bg-emerald-500 text-white" : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100"}`}
                    >
                      <span>{cat.name}</span>
                      {cat.subcategories?.length > 0 && (
                        <button
                          onClick={(e) => toggleExpand(e, cat.id)}
                          className="p-1 hover:bg-white/20 rounded"
                        >
                          <ChevronDown
                            size={14}
                            className={`transition-transform ${expandedCats[cat.id] ? "rotate-180" : ""}`}
                          />
                        </button>
                      )}
                    </div>

                    {expandedCats[cat.id] &&
                      cat.subcategories?.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setSelectedCategory(sub.id);
                            router.push(`/shop?category=${sub.id}`);
                          }}
                          className={`w-full text-left pl-8 pr-4 py-2 rounded-xl text-[11px] font-bold transition-all ${Number(selectedCategory) === sub.id ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                        >
                          • {sub.name}
                        </button>
                      ))}
                  </div>
                ))}
            </div>
          </div>

          {/* Dual Range Price Slider */}
          <div className="mb-6">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">
              Price: ৳{minPrice} - ৳{maxPrice}
            </label>
            <div className="relative h-10 flex items-center">
              <div className="absolute w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full" />
              <div
                className="absolute h-1.5 bg-emerald-500 rounded-full"
                style={{
                  left: `${(minPrice / 50000) * 100}%`,
                  right: `${100 - (maxPrice / 50000) * 100}%`,
                }}
              />
              <input
                type="range"
                min="0"
                max="50000"
                step="500"
                value={minPrice}
                onChange={(e) =>
                  setMinPrice(Math.min(Number(e.target.value), maxPrice - 1000))
                }
                className="absolute w-full appearance-none bg-transparent pointer-events-none z-30 accent-emerald-600"
              />
              <input
                type="range"
                min="0"
                max="50000"
                step="500"
                value={maxPrice}
                onChange={(e) =>
                  setMaxPrice(Math.max(Number(e.target.value), minPrice + 1000))
                }
                className="absolute w-full appearance-none bg-transparent pointer-events-none z-30 accent-emerald-600"
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
            className="w-full mt-4 px-4 py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all"
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
        <div className="mb-8 flex flex-col md:flex-row justify-between gap-4">
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
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 outline-none text-sm font-medium"
            />
          </div>
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 text-sm font-black uppercase tracking-tighter"
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
                  Loading...
                </p>
              </div>
            ) : currentItems.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {currentItems.map((p) => {
                    const discount = Number(p.point_value || 0);
                    const finalPrice = isActiveMember
                      ? Number(p.price) - discount
                      : Number(p.price);
                    return (
                      <div
                        key={p.id}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden group hover:shadow-xl transition-all flex flex-col"
                      >
                        <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden">
                          <Link
                            href={`/shop/${p.id}`}
                            className="block w-full h-full"
                          >
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </Link>
                          <div className="absolute top-3 left-3">
                            {isActiveMember && discount > 0 ? (
                              <span className="bg-orange-500 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase italic">
                                ৳{discount} OFF
                              </span>
                            ) : (
                              p.point_value > 0 && (
                                <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase">
                                  +{p.point_value} PV
                                </span>
                              )
                            )}
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <Link href={`/shop/${p.id}`}>
                            <h3 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 line-clamp-2">
                              {p.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm md:text-lg font-black text-emerald-600">
                              ৳{Math.floor(finalPrice)}
                            </span>
                            {isActiveMember && discount > 0 && (
                              <span className="text-[10px] text-slate-400 line-through">
                                ৳{Math.floor(p.price)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              p.stock > 0 && handleAddToCartWithToast(p)
                            }
                            className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mt-auto ${p.stock > 0 ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
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
                  <div className="mt-16 flex justify-center items-center gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border bg-white disabled:opacity-20"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => paginate(i + 1)}
                        className={`w-10 h-10 rounded-xl border text-xs font-bold ${currentPage === i + 1 ? "bg-emerald-600 text-white" : "bg-white"}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border bg-white disabled:opacity-20"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed text-slate-400 font-bold uppercase text-[10px]">
                No products found.
              </div>
            )}
          </main>
        </div>
      </div>
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden animate-in fade-in">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
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

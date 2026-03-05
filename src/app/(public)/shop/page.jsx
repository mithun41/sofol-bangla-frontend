"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ShoppingCart,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  LayoutGrid,
  LayoutList,
  Package,
  Filter,
  Check,
  ArrowUpDown,
} from "lucide-react";
import { getAllProducts, getAllCategories } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

const ITEMS_PER_PAGE = 16;

const SORT_OPTIONS = [
  { value: "default", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A → Z" },
  { value: "name_desc", label: "Name: Z → A" },
];

function sortProducts(products, sortBy) {
  const sorted = [...products];
  switch (sortBy) {
    case "price_asc":
      return sorted.sort(
        (a, b) => Number(a.__effectivePrice) - Number(b.__effectivePrice),
      );
    case "price_desc":
      return sorted.sort(
        (a, b) => Number(b.__effectivePrice) - Number(a.__effectivePrice),
      );
    case "name_asc":
      return sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    case "name_desc":
      return sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    default:
      return sorted;
  }
}

function getEffectivePrice(product, isActiveMember) {
  const base = Number(product.price || 0);
  const discount = Number(product.point_value || 0) * 2;
  return isActiveMember ? Math.max(0, base - discount) : base;
}

function getDescendantCategoryIds(categories, parentId) {
  const ids = new Set();
  const byParent = new Map();

  for (const c of categories || []) {
    const p = c.parent ?? c.parent_id ?? null;
    if (!byParent.has(p)) byParent.set(p, []);
    byParent.get(p).push(c);
  }

  const stack = [Number(parentId)];
  while (stack.length) {
    const cur = stack.pop();
    ids.add(Number(cur));
    const kids = byParent.get(Number(cur)) || byParent.get(cur) || [];
    for (const k of kids) stack.push(Number(k.id));
  }
  return ids;
}

function PriceRangeSlider({
  min,
  max,
  minVal,
  maxVal,
  onMinChange,
  onMaxChange,
}) {
  const minPercent = Math.round((minVal / max) * 100);
  const maxPercent = Math.round((maxVal / max) * 100);

  return (
    <div className="px-1">
      <div className="flex justify-between items-center mb-3">
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700">
          ৳{minVal.toLocaleString()}
        </div>
        <div className="h-px flex-1 bg-slate-200 mx-3" />
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700">
          ৳{maxVal.toLocaleString()}
        </div>
      </div>

      <div className="relative h-5 flex items-center mt-4">
        <div className="absolute w-full h-1.5 bg-slate-200 rounded-full" />
        <div
          className="absolute h-1.5 bg-emerald-500 rounded-full"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={500}
          value={minVal}
          onChange={(e) =>
            onMinChange(Math.min(Number(e.target.value), maxVal - 1000))
          }
          className="absolute w-full appearance-none bg-transparent cursor-pointer z-10"
          style={{ pointerEvents: "auto" }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={500}
          value={maxVal}
          onChange={(e) =>
            onMaxChange(Math.max(Number(e.target.value), minVal + 1000))
          }
          className="absolute w-full appearance-none bg-transparent cursor-pointer z-20"
          style={{ pointerEvents: "auto" }}
        />
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 2.5px solid #10b981;
          box-shadow: 0 1px 6px rgba(16,185,129,0.25);
          cursor: pointer;
        }
        input[type="range"]::-webkit-slider-runnable-track { background: transparent; }
      `}</style>
    </div>
  );
}

function ProductCard({ product, isActiveMember, onAddToCart, onOrderNow }) {
  const discount = Number(product.point_value || 0) * 2;
  const finalPrice = isActiveMember
    ? Math.max(0, Number(product.price || 0) - discount)
    : Number(product.price || 0);

  const outOfStock = Number(product.stock || 0) <= 0;

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-xl hover:shadow-emerald-50 dark:hover:shadow-emerald-950 transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative aspect-[3/4] bg-slate-50 dark:bg-slate-800 overflow-hidden">
        <Link href={`/shop/${product.id}`} className="block w-full h-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {outOfStock ? (
            <span className="bg-slate-800/80 backdrop-blur-sm text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
              Sold Out
            </span>
          ) : isActiveMember && discount > 0 ? (
            <span className="bg-orange-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide shadow-lg">
              ৳{discount} OFF
            </span>
          ) : product.point_value > 0 ? (
            <span className="bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide shadow-lg">
              +{product.point_value} PV
            </span>
          ) : null}
        </div>

        {/* Hover Quick Add overlay (same as before) */}
        {!outOfStock && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={() => onAddToCart(product)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingCart size={13} />
              Add to Cart
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/shop/${product.id}`}>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug hover:text-emerald-600 transition-colors mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Price + Always visible Order Now */}
        <div className="mt-auto">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-base font-black text-emerald-600">
                ৳{Math.floor(finalPrice).toLocaleString()}
              </p>
              {isActiveMember && discount > 0 && (
                <p className="text-[11px] text-slate-400 line-through mt-0.5">
                  ৳{Math.floor(product.price).toLocaleString()}
                </p>
              )}
            </div>

            {/* Mobile quick add icon stays same */}
            {outOfStock ? (
              <span className="text-[10px] text-slate-400 font-bold uppercase">
                Out of Stock
              </span>
            ) : (
              <button
                onClick={() => onAddToCart(product)}
                className="w-9 h-9 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-xl transition-all border border-emerald-200 dark:border-emerald-800 hover:border-emerald-600 lg:hidden"
              >
                <ShoppingCart size={14} />
              </button>
            )}
          </div>

          {/* Always visible Order Now button under price */}
          <button
            onClick={() => onOrderNow(product)}
            disabled={outOfStock}
            className="mt-3 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white text-[11px] font-black uppercase tracking-wide transition-all"
          >
            Order Now
          </button>

          {outOfStock && (
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">
              Out of Stock
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
function FilterSidebar({
  categories,
  selectedCategory,
  setSelectedCategory,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  onReset,
  onClose,
  isMobile,
  router,
}) {
  const [expandedCats, setExpandedCats] = useState({});

  const toggleExpand = (e, id) => {
    e.stopPropagation();
    setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCategorySelect = (id) => {
    setSelectedCategory(id === "All" ? "All" : id);
    if (id === "All") router.push("/shop");
    else router.push(`/shop?category=${id}`);
    if (isMobile && onClose) onClose();
  };

  const CategoryButton = ({
    id,
    label,
    depth = 0,
    hasChildren,
    isExpanded,
    onToggleExpand,
  }) => {
    const isActive =
      id === "All"
        ? selectedCategory === "All"
        : Number(selectedCategory) === Number(id);

    return (
      <div
        onClick={() => handleCategorySelect(id)}
        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all text-[12px] font-semibold ${
          depth > 0
            ? "ml-4 pl-4 border-l-2 border-slate-100 rounded-l-none"
            : ""
        } ${
          isActive
            ? "bg-emerald-500 text-white shadow-md shadow-emerald-100"
            : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
        }`}
      >
        <span className="flex items-center gap-2">
          {isActive && <Check size={12} className="flex-shrink-0" />}
          {label}
        </span>

        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(e, id);
            }}
            className={`ml-2 p-0.5 rounded transition-all ${
              isActive
                ? "hover:bg-white/20 text-white"
                : "hover:bg-slate-100 text-slate-400"
            }`}
            aria-label="Toggle subcategories"
          >
            <ChevronDown
              size={13}
              className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
    );
  };

  const topLevel = (categories || []).filter((c) => !(c.parent ?? c.parent_id));
  const getSubs = (cat) => cat.subcategories || cat.children || [];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-emerald-500" />
          <span className="font-black text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wide">
            Filters
          </span>
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-all"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-7">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">
            Categories
          </p>
          <div className="space-y-1">
            <CategoryButton id="All" label="All Products" />
            {topLevel.map((cat) => {
              const subs = getSubs(cat);
              const hasChildren = Array.isArray(subs) && subs.length > 0;
              return (
                <div key={cat.id}>
                  <CategoryButton
                    id={cat.id}
                    label={cat.name}
                    hasChildren={hasChildren}
                    isExpanded={expandedCats[cat.id]}
                    onToggleExpand={toggleExpand}
                  />
                  {expandedCats[cat.id] &&
                    subs.map((sub) => (
                      <div key={sub.id} className="mt-1 ml-3">
                        <CategoryButton
                          id={sub.id}
                          label={sub.name}
                          depth={1}
                        />
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-1">
            Price Range
          </p>
          <PriceRangeSlider
            min={0}
            max={50000}
            minVal={minPrice}
            maxVal={maxPrice}
            onMinChange={setMinPrice}
            onMaxChange={setMaxPrice}
          />
        </div>
      </div>

      <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onReset}
          className="w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-widest bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white transition-all"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPages = () => {
    const pages = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      }
    }
    const result = [];
    let prev;
    for (const p of pages) {
      if (prev && p - prev > 1) result.push("...");
      result.push(p);
      prev = p;
    }
    return result;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 mt-12">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 disabled:opacity-30 hover:border-emerald-400 hover:text-emerald-600 transition-all"
      >
        <ChevronsLeft size={15} />
      </button>

      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 disabled:opacity-30 hover:border-emerald-400 hover:text-emerald-600 transition-all"
      >
        <ChevronLeft size={15} />
      </button>

      {getPages().map((p, i) =>
        p === "..." ? (
          <span
            key={`e-${i}`}
            className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-xl text-sm font-bold transition-all border ${
              currentPage === p
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-600"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 disabled:opacity-30 hover:border-emerald-400 hover:text-emerald-600 transition-all"
      >
        <ChevronRight size={15} />
      </button>

      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 disabled:opacity-30 hover:border-emerald-400 hover:text-emerald-600 transition-all"
      >
        <ChevronsRight size={15} />
      </button>
    </div>
  );
}

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
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("default");
  const [sortDropdown, setSortDropdown] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [currentPage, setCurrentPage] = useState(1);

  const isActiveMember = user?.status === "active";

  useEffect(() => {
    setSelectedCategory(catQuery ? Number(catQuery) : "All");
  }, [catQuery]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          getAllProducts(),
          getAllCategories(),
        ]);
        const allProducts = Array.isArray(prodRes.data)
          ? prodRes.data
          : prodRes.data?.results;
        setProducts(allProducts || []);
        setCategories(catRes.data || []);
      } catch (e) {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, minPrice, maxPrice, sortBy]);

  const handleAddToCart = useCallback(
    (p) => {
      if (Number(p.stock || 0) <= 0) return;

      const finalPrice = getEffectivePrice(p, isActiveMember);
      const discountAmount = Number(p.point_value || 0) * 2;

      addToCart({
        ...p,
        price: finalPrice,
        point_value: isActiveMember ? 0 : Number(p.point_value || 0),
        quantity: 1,
      });

      toast.success(`${p.name} added to cart!`, {
        position: "top-center",
        style: { fontWeight: 600, borderRadius: "12px", fontSize: "13px" },
        iconTheme: { primary: "#10b981", secondary: "#fff" },
      });
    },
    [isActiveMember, addToCart],
  );

  const handleOrderNow = useCallback(
    (p) => {
      handleAddToCart(p);
      router.push("/checkout");
    },
    [handleAddToCart, router],
  );

  const handleReset = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setMinPrice(0);
    setMaxPrice(50000);
    setSortBy("default");
    router.push("/shop");
  };

  // Filter by what the user actually pays (member discount included)
  const filteredProducts = sortProducts(
    (products || [])
      .map((p) => ({
        ...p,
        __effectivePrice: getEffectivePrice(p, isActiveMember),
      }))
      .filter((p) => {
        const nameOk = (p.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        const productCatId = Number(p.category ?? p.category_id ?? 0);

        let catOk = true;
        if (selectedCategory !== "All") {
          const selectedId = Number(selectedCategory);
          const allowedIds = getDescendantCategoryIds(categories, selectedId);
          catOk = allowedIds.has(productCatId);
        }

        const priceOk =
          p.__effectivePrice >= minPrice && p.__effectivePrice <= maxPrice;

        return nameOk && catOk && priceOk;
      }),
    sortBy,
  );

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const currentItems = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const activeFilterCount = [
    selectedCategory !== "All",
    minPrice > 0,
    maxPrice < 50000,
    searchTerm !== "",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Toaster />

      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative hidden sm:block">
            <button
              onClick={() => setSortDropdown((p) => !p)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-emerald-400 transition-all whitespace-nowrap"
            >
              <ArrowUpDown size={14} className="text-slate-400" />
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
              <ChevronDown
                size={13}
                className={`text-slate-400 transition-transform ${sortDropdown ? "rotate-180" : ""}`}
              />
            </button>

            {sortDropdown && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-50">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      setSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center gap-2 ${
                      sortBy === opt.value
                        ? "text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium"
                    }`}
                  >
                    {sortBy === opt.value && <Check size={13} />}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-700 shadow-sm text-emerald-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-700 shadow-sm text-emerald-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <LayoutList size={15} />
            </button>
          </div>

          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden relative flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-emerald-400 transition-all"
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:flex flex-col w-64 flex-shrink-0">
            <div className="sticky top-[73px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm max-h-[calc(100vh-100px)] flex flex-col">
              <FilterSidebar
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                minPrice={minPrice}
                maxPrice={maxPrice}
                setMinPrice={setMinPrice}
                setMaxPrice={setMaxPrice}
                onReset={handleReset}
                router={router}
              />
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-600 font-black">
                    {filteredProducts.length}
                  </span>{" "}
                  products
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleReset}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold mt-0.5 underline underline-offset-2"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Page {currentPage} of {totalPages}
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  Loading products...
                </p>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <Package
                  size={40}
                  className="text-slate-300 dark:text-slate-600 mb-3"
                />
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  No products found
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {currentItems.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        isActiveMember={isActiveMember}
                        onAddToCart={handleAddToCart}
                        onOrderNow={handleOrderNow}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentItems.map((p) => {
                      const discount = Number(p.point_value || 0);
                      const finalPrice =
                        p.__effectivePrice ??
                        getEffectivePrice(p, isActiveMember);
                      const out = Number(p.stock || 0) <= 0;

                      return (
                        <div
                          key={p.id}
                          className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all flex gap-4 p-4"
                        >
                          <div className="w-24 h-24 rounded-xl bg-slate-50 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                            <Link href={`/shop/${p.id}`}>
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </Link>
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col">
                            <Link href={`/shop/${p.id}`}>
                              <h3 className="font-semibold text-slate-800 dark:text-slate-200 hover:text-emerald-600 transition-colors line-clamp-2 text-sm">
                                {p.name}
                              </h3>
                            </Link>

                            <div className="flex items-center gap-2 mt-auto">
                              <span className="text-base font-black text-emerald-600">
                                ৳{Math.floor(finalPrice).toLocaleString()}
                              </span>
                              {isActiveMember && discount > 0 && (
                                <span className="text-xs text-slate-400 line-through">
                                  ৳{Math.floor(p.price).toLocaleString()}
                                </span>
                              )}
                              {isActiveMember && discount > 0 && (
                                <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                                  ৳{discount} OFF
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex-shrink-0 self-center flex gap-2">
                            <button
                              onClick={() => handleAddToCart(p)}
                              disabled={out}
                              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl text-[11px] font-black uppercase tracking-wide transition-all whitespace-nowrap"
                            >
                              {out ? "Sold Out" : "Add to Cart"}
                            </button>

                            <button
                              onClick={() => handleOrderNow(p)}
                              disabled={out}
                              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl text-[11px] font-black uppercase tracking-wide transition-all whitespace-nowrap"
                            >
                              Order Now
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />

                <p className="text-center text-xs text-slate-400 mt-4">
                  Showing{" "}
                  {Math.min(
                    (currentPage - 1) * ITEMS_PER_PAGE + 1,
                    filteredProducts.length,
                  )}
                  –
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredProducts.length,
                  )}{" "}
                  of {filteredProducts.length} products
                </p>
              </>
            )}
          </main>
        </div>
      </div>

      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              onReset={() => {
                handleReset();
                setMobileFilterOpen(false);
              }}
              onClose={() => setMobileFilterOpen(false)}
              isMobile
              router={router}
            />
          </div>
        </div>
      )}

      {sortDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSortDropdown(false)}
        />
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="w-10 h-10 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}

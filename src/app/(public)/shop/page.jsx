"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  SlidersHorizontal,
  X,
  Heart,
} from "lucide-react";
import { getAllProducts, getAllCategories } from "@/services/productService";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState(5000);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          getAllProducts(),
          getAllCategories(),
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Data loading failed");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtering logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || p.category === parseInt(selectedCategory);
    const matchesPrice = Number(p.price || 0) <= priceRange;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const FilterPanel = ({ isMobile = false }) => (
    <div className={`${isMobile ? "p-6" : ""}`}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal size={20} />
              Filters
            </h3>
            {isMobile && (
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block">
              Categories
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === "All"
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block">
              Price Range: ${priceRange}
            </label>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs mt-2 text-slate-500">
              <span>$0</span>
              <span>$10,000</span>
            </div>
          </div>

          {/* Reset Button */}
          {(searchTerm ||
            selectedCategory !== "All" ||
            priceRange !== 5000) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setPriceRange(5000);
              }}
              className="w-full mt-6 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-sm transition-all"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header & Search Section (আগের মতোই থাকবে) */}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters (আগের মতোই থাকবে) */}
          <div className="hidden lg:block lg:col-span-1">
            <FilterPanel />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden group hover:shadow-md transition-all duration-300"
                  >
                    {/* Product Image Area */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 dark:bg-slate-800">
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

                      {/* Top Action Icons (Cart & Wishlist) */}
                      <div className="absolute top-2 right-2 flex flex-col gap-2">
                        {/* Cart Button */}
                        <button
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                            p.stock > 0
                              ? "bg-white dark:bg-slate-800 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed"
                          }`}
                          title="Add to Cart"
                        >
                          <ShoppingCart size={16} />
                        </button>

                        {/* Wishlist Button */}
                        <button className="w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-sm">
                          <Heart size={16} />
                        </button>
                      </div>

                      {/* PV Badge */}
                      {p.point_value > 0 && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {p.point_value} PV
                          </span>
                        </div>
                      )}

                      {/* Stock Status Label */}
                      {p.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-white/90 text-slate-900 text-[10px] font-bold px-2 py-1 rounded uppercase">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-3">
                      <Link href={`/shop/${p.id}`}>
                        <h3 className="text-xs md:text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5 hover:text-emerald-500 transition-colors line-clamp-1">
                          {p.name}
                        </h3>
                      </Link>

                      {/* Price Section */}
                      <div className="flex flex-col mb-3">
                        <span className="text-base font-bold text-emerald-600">
                          ৳{Number(p.price || 0)}
                        </span>
                        {p.original_price && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ৳{p.original_price}
                          </span>
                        )}
                      </div>

                      {/* Bottom Button */}
                      <Link
                        href={p.stock > 0 ? `/checkout?product=${p.id}` : "#"}
                        className={`w-full block text-center py-2 rounded-lg text-xs font-bold transition-all ${
                          p.stock > 0
                            ? "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                        onClick={(e) => p.stock === 0 && e.preventDefault()}
                      >
                        Order Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

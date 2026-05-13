"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import useSWR from "swr";
import { getAllProducts, getAllCategorie } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

import ShopHeader from "./components/ShopHeader";
import FilterSidebar from "./components/FilterSidebar";
import ProductGrid from "./components/ProductGrid";

const BATCH_SIZE = 20;

const productFetcher = () =>
  getAllProducts().then((r) =>
    Array.isArray(r.data) ? r.data : r.data.results || [],
  );

const categoryFetcher = () =>
  getAllCategorie().then((r) =>
    Array.isArray(r.data) ? r.data : r.data.results || [],
  );

export default function ShopContent() {
  const { addToCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const loaderRef = useRef(null);

  const { data: products = [], isLoading: productsLoading } = useSWR(
    "all-products",
    productFetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  );

  const { data: categories = [], isLoading: categoriesLoading } = useSWR(
    "main-categories",
    categoryFetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  );

  const loading = productsLoading || categoriesLoading;

  const [search, setSearch]                     = useState("");
  const [debouncedSearch, setDebouncedSearch]   = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice]                 = useState(0);
  const [maxPrice, setMaxPrice]                 = useState(10000);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount]         = useState(BATCH_SIZE);
  const [isFetching, setIsFetching]             = useState(false);

  useEffect(() => {
    const categoryId = searchParams.get("category");
    setSelectedCategory(categoryId || "All");
    setVisibleCount(BATCH_SIZE);
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setVisibleCount(BATCH_SIZE);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCategoryChange = useCallback((cat) => {
    setSelectedCategory(cat);
    setVisibleCount(BATCH_SIZE);
  }, []);

  const handlePriceChange = useCallback((min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
    setVisibleCount(BATCH_SIZE);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const nameMatch = (p.name || "")
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());
      const categoryMatch =
        selectedCategory === "All"
          ? true
          : Number(p.category) === Number(selectedCategory);
      const priceMatch =
        Number(p.price) >= minPrice && Number(p.price) <= maxPrice;
      return nameMatch && categoryMatch && priceMatch;
    });
  }, [products, debouncedSearch, selectedCategory, minPrice, maxPrice]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount],
  );

  const hasMore = visibleCount < filteredProducts.length;

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          setIsFetching(true);
          setTimeout(() => {
            setVisibleCount((prev) => prev + BATCH_SIZE);
            setIsFetching(false);
          }, 300);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isFetching]);

  const handleAddToCart = useCallback(
    (product) => {
      addToCart(product);
      toast.success(`${product.name} added to cart`);
    },
    [addToCart],
  );

  const handleOrderNow = useCallback(
    (product) => {
      addToCart(product);
      router.push("/checkout");
    },
    [addToCart, router],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="bottom-right" />

      <ShopHeader
        search={search}
        setSearch={setSearch}
        openFilter={() => setMobileFilterOpen(true)}
        totalResults={filteredProducts.length}
        loading={loading}
      />

      <div className="max-w-11/12 mx-auto px-4 py-8 flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0">
          <FilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={handleCategoryChange}
            minPrice={minPrice}
            maxPrice={maxPrice}
            setMinPrice={(v) => handlePriceChange(v, maxPrice)}
            setMaxPrice={(v) => handlePriceChange(minPrice, v)}
          />
        </aside>

        <div className="flex-1 min-w-0">
          <ProductGrid
            products={visibleProducts}
            loading={loading}
            onAddToCart={handleAddToCart}
            onOrderNow={handleOrderNow}
            totalResults={filteredProducts.length}
          />

          {/* Scroll Sentinel */}
          <div ref={loaderRef} className="py-8 flex justify-center">
            {isFetching && (
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                <span className="w-4 h-4 border-2 border-slate-300 border-t-[#FF620A] rounded-full animate-spin" />
                Loading more...
              </div>
            )}
            {!hasMore && !loading && filteredProducts.length > 0 && (
              <p className="text-xs text-slate-400 font-semibold">
                সব {filteredProducts.length} টি product দেখানো হয়েছে
              </p>
            )}
          </div>
        </div>
      </div>

      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[999] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-4 overflow-y-auto">
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={handleCategoryChange}
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={(v) => handlePriceChange(v, maxPrice)}
              setMaxPrice={(v) => handlePriceChange(minPrice, v)}
              closeDrawer={() => setMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
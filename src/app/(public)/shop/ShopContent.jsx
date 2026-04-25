"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import useSWR from "swr";
import { getAllProducts, getAllCategorie } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

import ShopHeader from "./components/ShopHeader";
import FilterSidebar from "./components/FilterSidebar";
import ProductGrid from "./components/ProductGrid";
import Pagination from "./components/Pagination";

const PRODUCTS_PER_PAGE = 35;

// SWR fetchers — key same থাকলে cache hit হবে, নতুন call হবে না
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

  // SWR দিয়ে data fetch — page navigate করলে cache থেকে দেবে, reload হবে না
  const { data: products = [], isLoading: productsLoading } = useSWR(
    "all-products",
    productFetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }, // ১ মিনিট cache
  );

  const { data: categories = [], isLoading: categoriesLoading } = useSWR(
    "main-categories",
    categoryFetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 },
  );

  const loading = productsLoading || categoriesLoading;

  // Filter states
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // URL থেকে category নেওয়া
  useEffect(() => {
    const categoryId = searchParams.get("category");
    setSelectedCategory(categoryId || "All");
    setCurrentPage(1);
  }, [searchParams]);

  // Search debounce — টাইপ করার সাথে সাথে filter না করে ৩০০ms পরে করবে
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // search করলে page 1 এ ফিরে যাবে
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Filter change হলে page 1 এ রিসেট
  const handleCategoryChange = useCallback((cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  }, []);

  const handlePriceChange = useCallback((min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
    setCurrentPage(1);
  }, []);

  // useMemo দিয়ে filter — products বা search না বদলালে recalculate হবে না
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

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // page change হলে উপরে scroll করবে
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
        {/* Desktop Sidebar */}
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

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <ProductGrid
            products={paginatedProducts}
            loading={loading}
            onAddToCart={handleAddToCart}
            onOrderNow={handleOrderNow}
            totalResults={filteredProducts.length}
            currentPage={currentPage}
            totalPages={totalPages}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Mobile Filter Drawer */}
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

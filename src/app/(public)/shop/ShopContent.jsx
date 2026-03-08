"use client";

import { useState, useEffect } from "react";
import { getAllProducts, getAllCategories } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import ShopHeader from "./components/ShopHeader";
import FilterSidebar from "./components/FilterSidebar";
import ProductGrid from "./components/ProductGrid";

export default function ShopContent() {
  const { addToCart } = useCart();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const [prodRes, catRes] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
      ]);

      const data = Array.isArray(prodRes.data)
        ? prodRes.data
        : prodRes.data.results;

      setProducts(data || []);
      setCategories(catRes.data || []);

      setLoading(false);
    })();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);

    toast.success(`${product.name} added to cart`);
  };

  const handleOrderNow = (product) => {
    addToCart(product);

    router.push("/checkout");
  };

  const filteredProducts = products.filter((p) => {
    const nameMatch = (p.name || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const categoryMatch =
      selectedCategory === "All"
        ? true
        : Number(p.category) === Number(selectedCategory);

    const priceMatch =
      Number(p.price) >= minPrice && Number(p.price) <= maxPrice;

    return nameMatch && categoryMatch && priceMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <ShopHeader
        search={search}
        setSearch={setSearch}
        openFilter={() => setMobileFilterOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        <aside className="hidden lg:block w-64">
          <FilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            minPrice={minPrice}
            maxPrice={maxPrice}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
          />
        </aside>

        <ProductGrid
          products={filteredProducts}
          loading={loading}
          onAddToCart={handleAddToCart}
          onOrderNow={handleOrderNow}
        />
      </div>

      {/* MOBILE FILTER */}

      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[999] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFilterOpen(false)}
          />

          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-4 overflow-y-auto">
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              minPrice={minPrice}
              maxPrice={maxPrice}
              setMinPrice={setMinPrice}
              setMaxPrice={setMaxPrice}
              closeDrawer={() => setMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

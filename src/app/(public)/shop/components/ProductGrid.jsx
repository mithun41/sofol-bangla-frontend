import ProductCard from "./ProductCard";

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
      <div className="aspect-[3/4] bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="h-8 bg-slate-200 rounded-xl mt-4" />
      </div>
    </div>
  );
}

export default function ProductGrid({
  products,
  loading,
  onAddToCart,
  onOrderNow,
  totalResults,
  currentPage,
  totalPages,
}) {
  if (loading) {
    return (
      <div className="flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 16 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!loading && products.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-10 h-10 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4"
            />
          </svg>
        </div>
        <h3 className="text-base font-bold text-slate-700 mb-1">
          No products found
        </h3>
        <p className="text-sm text-slate-400">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Result count + page info */}
      {totalResults > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-500 font-medium">
            <span className="text-slate-800 font-bold">{totalResults}</span>{" "}
            products found
          </p>
          {totalPages > 1 && (
            <p className="text-xs text-slate-400">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onAddToCart={onAddToCart}
            onOrderNow={onOrderNow}
          />
        ))}
      </div>
    </div>
  );
}

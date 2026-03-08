import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
  loading,
  onAddToCart,
  onOrderNow,
}) {
  if (loading) {
    return (
      <div className="flex-1 flex justify-center py-24">
        <div className="w-12 h-12 border-4 border-orange-100 border-t-[#FF620A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4  gap-6">
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

"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById, getAllProducts } from "@/services/productService";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, cart } = useCart();

  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const isActiveMember = user?.status === "active";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getProductById(id);
        setProduct(res.data);

        const all = await getAllProducts();
        const related = all.data
          .filter(
            (p) => p.category === res.data.category && p.id !== res.data.id,
          )
          .slice(0, 4);

        setRelatedProducts(related);
      } catch (err) {
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!product)
    return <div className="text-center py-20 font-bold">Product not found</div>;

  const originalPrice = Number(product.price);
  const pointValue = Number(product.point_value || 0);

  const finalPrice = isActiveMember
    ? originalPrice - pointValue
    : originalPrice;

  const existingItem = cart.find((item) => item.id === product.id);

  const existingQty = existingItem ? existingItem.quantity : 0;

  const handleAddToCart = () => {
    if (product.stock <= 0) return;

    addToCart({
      ...product,
      quantity,
      price: finalPrice,
    });

    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/cart");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <Link
          href="/shop"
          className="flex items-center gap-2 text-gray-500 mb-8"
        >
          <ArrowLeft size={18} /> Back to shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* LEFT - IMAGE */}
          <div className="bg-white rounded-2xl shadow p-8 mb-2">
            <img
              src={product.image}
              alt={product.name}
              className="w-full max-h-[500px] object-contain"
            />
          </div>

          {/* RIGHT - INFO */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-widest">
                {product.category_name}
              </p>

              <h1 className="text-4xl font-bold mt-2">{product.name}</h1>
            </div>

            {/* PRICE */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-black">
                  ৳{finalPrice}
                </span>

                {isActiveMember && pointValue > 0 && (
                  <span className="line-through text-gray-400 text-lg">
                    ৳{originalPrice}
                  </span>
                )}
              </div>

              {product.stock > 0 ? (
                <p className="text-green-600 text-sm font-medium">In Stock</p>
              ) : (
                <p className="text-red-500 text-sm font-medium">Out of Stock</p>
              )}

              {existingQty > 0 && (
                <p className="text-sm text-blue-600">
                  Already in cart: {existingQty}
                </p>
              )}
            </div>

            {/* QUANTITY */}
            <div>
              <p className="text-sm font-medium mb-2">Quantity</p>
              <div className="flex items-center border rounded w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2"
                >
                  -
                </button>
                <span className="px-6 font-semibold">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-4 py-2"
                >
                  +
                </button>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 bg-black text-white py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 disabled:bg-gray-300"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="flex-1 border border-black py-4 rounded-lg hover:bg-black hover:text-white transition disabled:border-gray-300 disabled:text-gray-400"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t">
          <h3 className="text-xl font-semibold mb-4">Product Description</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-bold mb-8">Related Products</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/shop/${p.id}`}
                  className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
                >
                  <img
                    src={p.image}
                    className="h-40 w-full object-cover rounded mb-4"
                    alt={p.name}
                  />
                  <h4 className="font-semibold text-sm line-clamp-1">
                    {p.name}
                  </h4>
                  <p className="text-black font-bold mt-1">৳{p.price}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

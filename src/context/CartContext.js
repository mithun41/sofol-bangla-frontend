"use client";
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

/** Always returns a URL with exactly one trailing slash */
const apiUrl = (path) => {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");
  return `${base}/${cleanPath}`;
};

/** fetch with AbortController timeout (default 10s) */
const fetchWithTimeout = (url, options = {}, timeoutMs = 10_000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
};

// ─────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAuthToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("access") : null;

  // ── Init ──────────────────────────────────────────────
  useEffect(() => {
    const initCart = async () => {
      const token = getAuthToken();
      if (token) {
        await fetchDatabaseCart(token);
      } else {
        try {
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            setCart(parsedCart);             // show locally first
            await syncGuestCart(parsedCart); // then sync in background
          }
        } catch (e) {
          console.error("initCart failed:", e);
          localStorage.removeItem("cart");   // corrupt JSON → clear
        }
      }
    };
    initCart();
  }, []);

  // ── Fetch DB cart ─────────────────────────────────────
  const fetchDatabaseCart = async (token) => {
    setLoading(true);
    try {
      const res = await fetchWithTimeout(apiUrl("products/cart/"), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Cart fetch failed: ${res.status}`);

      const data = await res.json();
      const formattedCart = data.map((item) => {
        const originalPrice = Number(item.product_price || 0);
        const qty = Number(item.quantity || 0);
        return {
          id: item.product,
          cartItemId: item.id,
          name: item.product_name,
          price: originalPrice,
          image: item.product_image,
          quantity: qty,
          unit_type: item.unit_type,
          point_value: Number(item.product_pv || 0),
          item_subtotal: originalPrice * qty,
        };
      });
      setCart(formattedCart);
    } catch (err) {
      if (err.name === "AbortError") {
        console.warn("Cart fetch timed out");
      } else {
        console.error("DB Cart fetch failed:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Sync guest cart ───────────────────────────────────
  const syncGuestCart = async (currentCart) => {
    if (!currentCart?.length) return;

    // Validate env before hitting network
    if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
      console.warn("NEXT_PUBLIC_API_BASE_URL is not set — skipping guest sync");
      return;
    }

    try {
      const ids = currentCart.map((item) => item.id);
      const response = await fetchWithTimeout(
        apiUrl("products/sync-cart/"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        }
      );

      if (!response.ok) {
        console.warn("Guest sync responded with:", response.status);
        return; // keep local cart as-is
      }

      const latestProducts = await response.json();
      const updatedCart = currentCart.map((cartItem) => {
        const dbProduct = latestProducts.find((p) => p.id === cartItem.id);
        if (dbProduct) {
          const originalPrice = Number(dbProduct.price);
          return {
            ...cartItem,
            ...dbProduct,
            price: originalPrice,
            quantity: Number(cartItem.quantity),
            item_subtotal: originalPrice * Number(cartItem.quantity),
          };
        }
        return cartItem; // product not found in DB → keep local copy
      });

      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } catch (err) {
      if (err.name === "AbortError") {
        console.warn("Guest sync timed out — keeping local cart");
      } else {
        console.error("Guest sync failed:", err);
      }
      // ✅ Local cart is untouched; user can still shop offline
    }
  };

  // ── Add to cart ───────────────────────────────────────
  const addToCart = async (product, quantity = 1) => {
    const token = getAuthToken();
    const qtyToAdd = Number(quantity);

    if (token) {
      // Optimistic update
      setCart((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.id === product.id
              ? { ...i, quantity: i.quantity + qtyToAdd }
              : i
          );
        }
        return [
          ...prev,
          {
            ...product,
            quantity: qtyToAdd,
            point_value: Number(product.point_value || 0),
            item_subtotal: Number(product.price) * qtyToAdd,
          },
        ];
      });

      try {
        await fetchWithTimeout(apiUrl("products/cart/"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ product: product.id, quantity: qtyToAdd }),
        });
      } catch (err) {
        console.error("addToCart API failed:", err);
      } finally {
        await fetchDatabaseCart(token); // reconcile either way
      }
    } else {
      setCart((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        let newCart;
        if (existing) {
          newCart = prev.map((i) =>
            i.id === product.id
              ? {
                  ...i,
                  quantity: Number((i.quantity + qtyToAdd).toFixed(3)),
                  item_subtotal: (i.quantity + qtyToAdd) * i.price,
                }
              : i
          );
        } else {
          newCart = [
            ...prev,
            {
              ...product,
              quantity: qtyToAdd,
              unit_type: product.unit_type,
              item_subtotal: Number(product.price) * qtyToAdd,
            },
          ];
        }
        localStorage.setItem("cart", JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  // ── Update quantity ───────────────────────────────────
  const updateQuantity = async (id, cartItemId, change) => {
    const token = getAuthToken();
    const currentItem = cart.find((i) =>
      token ? i.cartItemId === cartItemId : i.id === id
    );
    if (!currentItem) return;

    const step = currentItem.unit_type === "kg" ? 0.25 : 1;
    const newQty = parseFloat((parseFloat(currentItem.quantity) + change).toFixed(3));
    if (newQty < step) return;

    if (token && cartItemId) {
      try {
        const res = await fetchWithTimeout(
          apiUrl(`products/cart/${cartItemId}/`),
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity: newQty }),
          }
        );
        if (res.ok) fetchDatabaseCart(token);
      } catch (err) {
        console.error("updateQuantity failed:", err);
      }
    } else {
      setCart((prev) => {
        const updated = prev.map((i) =>
          i.id === id
            ? { ...i, quantity: newQty, item_subtotal: (newQty * i.price).toFixed(2) }
            : i
        );
        localStorage.setItem("cart", JSON.stringify(updated));
        return updated;
      });
    }
  };

  // ── Remove from cart ──────────────────────────────────
  const removeFromCart = async (id, cartItemId) => {
    const token = getAuthToken();
    if (token && cartItemId) {
      try {
        await fetchWithTimeout(apiUrl(`products/cart/${cartItemId}/`), {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchDatabaseCart(token);
      } catch (err) {
        console.error("removeFromCart failed:", err);
      }
    } else {
      setCart((prev) => {
        const newCart = prev.filter((i) => i.id !== id);
        localStorage.setItem("cart", JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  // ── Clear cart ────────────────────────────────────────
  const clearCart = async () => {
    const token = getAuthToken();
    if (token) {
      try {
        await fetchWithTimeout(apiUrl("products/cart/clear/"), {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart([]);
      } catch (err) {
        console.error("clearCart failed:", err);
      }
    } else {
      setCart([]);
      localStorage.removeItem("cart");
    }
  };

  // ── POS: restore without DB sync ─────────────────────
  const restoreCart = (items) => setCart(items);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, restoreCart, loading }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
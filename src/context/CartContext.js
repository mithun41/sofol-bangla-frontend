"use client";
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // ১. টোকেন গেট করার ফাংশন
  const getAuthToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("access") : null;

  // ২. অ্যাপ লোড হওয়ার সময় ডাটা নিয়ে আসা (Initial Sync)
  useEffect(() => {
    const initCart = async () => {
      const token = getAuthToken();

      if (token) {
        // ইউজার লগইন থাকলে ডাটাবেস থেকে কার্ট আনো
        await fetchDatabaseCart(token);
      } else {
        // গেস্ট হলে লোকাল স্টোরেজ থেকে নাও এবং sync-cart এপিআই দিয়ে চেক করো
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
          syncGuestCart(parsedCart);
        }
      }
    };
    initCart();
  }, []);

  // ৩. ডাটাবেস থেকে কার্ট আনার ফাংশন (লগইন ইউজারের জন্য)
  const fetchDatabaseCart = async (token) => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://mithun41.pythonanywhere.com/api/products/cart/",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        // ব্যাকএন্ড থেকে আসা ডাটাকে ফ্রন্টএন্ডের ফরম্যাটে ম্যাপিং
        const formattedCart = data.map((item) => ({
          id: item.product,
          cartItemId: item.id, // এটি ডাটাবেসের কার্ট রো আইডি (ডিলিট/আপডেটের জন্য)
          name: item.product_name,
          price: item.product_price,
          image: item.product_image,
          quantity: item.quantity,
          point_value: item.product_pv,
        }));
        setCart(formattedCart);
      }
    } catch (err) {
      console.error("DB Cart fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  // ৪. গেস্ট কার্ট সিঙ্ক (লগইন ছাড়া ইউজার)
  const syncGuestCart = async (currentCart) => {
    if (!currentCart.length) return;
    try {
      const ids = currentCart.map((item) => item.id);
      const response = await fetch(
        "https://mithun41.pythonanywhere.com/api/products/sync-cart/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids }),
        },
      );
      if (response.ok) {
        const latestProducts = await response.json();
        const updatedCart = currentCart.map((cartItem) => {
          const dbProduct = latestProducts.find((p) => p.id === cartItem.id);
          return dbProduct
            ? { ...cartItem, ...dbProduct, price: dbProduct.price }
            : cartItem;
        });
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
      }
    } catch (err) {
      console.error("Guest sync failed", err);
    }
  };

  // ৫. কার্টে আইটেম যোগ করা
  const addToCart = async (product) => {
    const token = getAuthToken();
    if (token) {
      try {
        await fetch("https://mithun41.pythonanywhere.com/api/products/cart/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ product: product.id, quantity: 1 }),
        });
        fetchDatabaseCart(token);
      } catch (err) {
        console.error(err);
      }
    } else {
      setCart((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        const newCart = existing
          ? prev.map((i) =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
            )
          : [...prev, { ...product, quantity: 1 }];
        localStorage.setItem("cart", JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  // ৬. কোয়ান্টিটি আপডেট করা (Plus/Minus)
  const updateQuantity = async (id, cartItemId, change) => {
    const token = getAuthToken();
    const currentItem = cart.find((i) => i.id === id);
    if (!currentItem) return;

    const newQty = Math.max(1, currentItem.quantity + change);

    if (token && cartItemId) {
      try {
        await fetch(
          `https://mithun41.pythonanywhere.com/api/products/cart/${cartItemId}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity: newQty }),
          },
        );
        fetchDatabaseCart(token);
      } catch (err) {
        console.error(err);
      }
    } else {
      setCart((prev) => {
        const updated = prev.map((i) =>
          i.id === id ? { ...i, quantity: newQty } : i,
        );
        localStorage.setItem("cart", JSON.stringify(updated));
        return updated;
      });
    }
  };

  // ৭. আইটেম রিমুভ করা
  const removeFromCart = async (id, cartItemId) => {
    const token = getAuthToken();
    if (token && cartItemId) {
      try {
        await fetch(
          `https://mithun41.pythonanywhere.com/api/products/cart/${cartItemId}/`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        fetchDatabaseCart(token);
      } catch (err) {
        console.error(err);
      }
    } else {
      setCart((prev) => {
        const newCart = prev.filter((i) => i.id !== id);
        localStorage.setItem("cart", JSON.stringify(newCart));
        return newCart;
      });
    }
  };

  // ৮. পুরো কার্ট খালি করা
  const clearCart = async () => {
    const token = getAuthToken();
    if (token) {
      // ব্যাকএন্ডে কাস্টম 'clear' অ্যাকশন থাকলে সেটা কল করা যায়, নাহলে লুপ
      await fetch(
        "https://mithun41.pythonanywhere.com/api/products/cart/clear/",
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setCart([]);
    } else {
      setCart([]);
      localStorage.removeItem("cart");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// এই সেই হুক যেটা তুই এক্সপোর্ট করতে ভুলে গিয়েছিলে মামা!
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

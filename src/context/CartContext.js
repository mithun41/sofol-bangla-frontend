"use client";
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // ১. টোকেন গেট করার ফাংশন
  const getAuthToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("access") : null;

  // ২. অ্যাপ লোড হওয়ার সময় ডাটা নিয়ে আসা
  useEffect(() => {
    const initCart = async () => {
      const token = getAuthToken();
      if (token) {
        await fetchDatabaseCart(token);
      } else {
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

  // ৩. ডাটাবেস থেকে কার্ট আনার ফাংশন
  // ৩. ডাটাবেস থেকে কার্ট আনার ফাংশন
  const fetchDatabaseCart = async (token) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}products/cart/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();

        const formattedCart = data.map((item) => {
          // 🚨 মামা এই জায়গাটা খেয়াল কর:
          // আমরা ব্যাকএন্ডের পাঠানো item_subtotal এর ওপর নির্ভর করব না।
          // আমরা সরাসরি product_price আর quantity গুণ করে আসল সাবটোটাল বের করব।
          const originalPrice = Number(item.product_price || 0);
          const qty = Number(item.quantity || 0);

          return {
            id: item.product,
            cartItemId: item.id,
            name: item.product_name,
            price: originalPrice, // সব সময় মেইন প্রাইস
            image: item.product_image,
            quantity: qty,
            unit_type: item.unit_type,
            point_value: Number(item.product_pv || 0),
            // সাবটোটাল হবে পিওর প্রাইস * কোয়ান্টিটি
            item_subtotal: originalPrice * qty,
          };
        });
        setCart(formattedCart);
      }
    } catch (err) {
      console.error("DB Cart fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  // ৪. গেস্ট কার্ট সিঙ্ক
  const syncGuestCart = async (currentCart) => {
    if (!currentCart.length) return;
    try {
      const ids = currentCart.map((item) => item.id);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}products/sync-cart/`,
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
          if (dbProduct) {
            // 🚨 মেইন প্রাইস নিশ্চিত করা হচ্ছে
            const originalPrice = Number(dbProduct.price);
            return {
              ...cartItem,
              ...dbProduct,
              price: originalPrice,
              quantity: Number(cartItem.quantity),
              item_subtotal: originalPrice * Number(cartItem.quantity),
            };
          }
          return cartItem;
        });
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
      }
    } catch (err) {
      console.error("Guest sync failed", err);
    }
  };

  // ৫. কার্টে আইটেম যোগ করা
  const addToCart = async (product, quantity = 1) => {
    const token = getAuthToken();
    const qtyToAdd = Number(quantity);

    if (token) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}products/cart/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product: product.id,
            quantity: qtyToAdd,
          }),
        });
        fetchDatabaseCart(token);
      } catch (err) {
        console.error(err);
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
              : i,
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

  // ৬. কোয়ান্টিটি আপডেট করা (Plus/Minus)
  const updateQuantity = async (id, cartItemId, change) => {
    const token = getAuthToken();

    // ১. আইটেমটা খুঁজে বের করা
    const currentItem = cart.find((i) =>
      token ? i.cartItemId === cartItemId : i.id === id,
    );

    if (!currentItem) return;

    // ২. স্টেপ নির্ধারণ (কেজি হলে ০.২৫, পিস হলে ১)
    const step = currentItem.unit_type === "kg" ? 0.25 : 1;

    // ৩. নতুন কোয়ান্টিটি ক্যালকুলেশন (Number এবং toFixed ব্যবহার করা মাস্ট)
    // parseFloat ব্যবহার করছি যাতে স্ট্রিং থাকলেও সেটা নাম্বারে কনভার্ট হয়
    const currentQty = parseFloat(currentItem.quantity);
    const newQty = parseFloat((currentQty + change).toFixed(3));

    // ৪. মিনিমাম চেক (স্টেপ এর চেয়ে কম হতে পারবে না)
    if (newQty < step) return;

    if (token && cartItemId) {
      try {
        // ৫. ডাটাবেস আপডেট (PATCH)
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}products/cart/${cartItemId}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity: newQty }),
          },
        );

        if (res.ok) {
          fetchDatabaseCart(token); // সাকসেস হলে ডাটা রিফ্রেশ
        }
      } catch (err) {
        console.error("Update failed:", err);
      }
    } else {
      // ৬. গেস্ট ইউজারের জন্য লোকাল স্টোরেজ আপডেট
      setCart((prev) => {
        const updated = prev.map((i) =>
          i.id === id
            ? {
                ...i,
                quantity: newQty,
                item_subtotal: (newQty * i.price).toFixed(2),
              }
            : i,
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
          `${process.env.NEXT_PUBLIC_API_BASE_URL}products/cart/${cartItemId}/`,
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
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}products/cart/clear/`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setCart([]);
      } catch (err) {
        console.error(err);
      }
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
};;

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

"use client";
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // ১. ইনিশিয়াল স্টেট হিসেবে localStorage থেকে ডাটা নেওয়ার চেষ্টা করা
  const [cart, setCart] = useState([]);

  // ২. পেজ প্রথমবার লোড হলে localStorage থেকে কার্ট ডাটা লোড করা
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart data", error);
      }
    }
  }, []);

  // ৩. কার্ট স্টেট যখনই পরিবর্তন হবে, তখনই সেটা localStorage-এ সেভ করা
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    } else {
      // কার্ট খালি হলে localStorage থেকেও কি-টা মুছে ফেলা ভালো
      localStorage.removeItem("cart");
    }
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      // পয়েন্ট ভ্যালুসহ প্রোডাক্ট অ্যাড করা
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };
  const updateQuantity = (id, change) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) } // কোয়ান্টিটি যেন ১ এর নিচে না যায়
          : item,
      ),
    );
  };
  return (
    <CartContext.Provider
      value={{ cart, updateQuantity, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

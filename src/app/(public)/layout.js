import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import "../../app/globals.css";
import { CartProvider } from "@/context/CartContext";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
  return (
    <CartProvider>
      <AuthProvider>
        <Navbar />
        {children}
        <Footer />
        <Toaster />
      </AuthProvider>
    </CartProvider>
  );
}

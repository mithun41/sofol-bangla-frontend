import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import "../../app/globals.css";
import { CartProvider } from "@/context/CartContext";

export default function RootLayout({ children }) {
  return (
    <CartProvider>
      <AuthProvider>
        <Navbar />
        {children}
      </AuthProvider>
    </CartProvider>
  );
}

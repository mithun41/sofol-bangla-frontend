import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext"; // এই লাইনটা যোগ কর
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            {" "}
            {/* কার্ট প্রোভাইডার এখানে থাকবে */}
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

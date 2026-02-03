import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import "../../app/globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

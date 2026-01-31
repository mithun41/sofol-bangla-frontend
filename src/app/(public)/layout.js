import Navbar from "@/components/Navbar";

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <footer className="p-10 bg-gray-50 text-center border-t">
        © 2026 Your Company
      </footer>
    </>
  );
}

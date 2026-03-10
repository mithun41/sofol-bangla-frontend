"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import Logo from "./Logo";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop", icon: <ShoppingBag size={18} /> },
    { name: "About", href: "/about" },
  ];

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (path) => pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-xl border-b border-slate-200/70 sticky top-0 z-[100] shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left */}
          <div className="flex items-center gap-12">
            <Logo size={70} />

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    isActive(link.href)
                      ? "text-[#FF620A] bg-orange-50"
                      : "text-slate-600 hover:text-[#007A55] hover:bg-slate-50"
                  }`}
                >
                  {link.icon && link.icon}
                  {link.name}

                  {isActive(link.href) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-[#FF620A] to-[#007A55] rounded-full"></span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative group p-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-300"
            >
              <ShoppingCart
                size={22}
                className="group-hover:text-[#FF620A] transition-colors"
                strokeWidth={2.5}
              />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF620A] text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-lg">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-2 rounded-xl hover:bg-slate-50 border-2 border-slate-100 hover:border-[#FF620A]/30 transition-all duration-300"
                >
                  <div className="relative">
                    <img
                      src={
                        user.profile_picture ||
                        `https://ui-avatars.com/api/?name=${user.username}&background=FF620A&color=fff&bold=true`
                      }
                      alt="Profile"
                      className="h-9 w-9 rounded-lg object-cover ring-2 ring-white"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#007A55] border-2 border-white rounded-full"></span>
                  </div>

                  <ChevronDown
                    size={16}
                    className={`text-slate-500 hidden sm:block transition-transform duration-300 ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                    strokeWidth={2.5}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white border-2 border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="px-5 py-4 bg-gradient-to-br from-orange-50 to-emerald-50 border-b border-slate-100">
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">
                        Signed in as
                      </p>

                      <p className="text-base font-black text-slate-800 truncate mb-2">
                        {user.name}
                      </p>

                      <span className="inline-flex items-center gap-1.5 bg-white text-[#007A55] px-3 py-1 rounded-lg text-xs font-black uppercase shadow-sm">
                        <span className="w-1.5 h-1.5 bg-[#007A55] rounded-full"></span>
                        {user.role}
                      </span>
                    </div>

                    {/* Menu */}
                    <div className="py-2">
                      <Link
                        href={
                          user.role === "admin"
                            ? "/admin-dashboard"
                            : "/dashboard"
                        }
                        className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-orange-50 hover:text-[#FF620A] transition-all duration-200"
                      >
                        <LayoutDashboard size={18} strokeWidth={2.5} />
                        <span>My Dashboard</span>
                      </Link>

                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-all duration-200 border-t border-slate-100 mt-1"
                      >
                        <LogOut size={18} strokeWidth={2.5} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-bold text-slate-600 hover:text-[#007A55] px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all duration-300"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  className="relative group bg-[#FF620A] text-white text-sm font-black px-6 py-2.5 rounded-xl hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-300 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  <span className="relative">Join Now</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 md:hidden text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-300"
            >
              {isMobileMenuOpen ? (
                <X size={24} strokeWidth={2.5} />
              ) : (
                <Menu size={24} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-white to-slate-50 border-t border-slate-200 p-4 space-y-2 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-all duration-300 ${
                isActive(link.href)
                  ? "bg-gradient-to-r from-orange-50 to-emerald-50 text-[#FF620A] shadow-sm"
                  : "text-slate-600 hover:bg-white"
              }`}
            >
              {link.icon && link.icon}
              {link.name}
            </Link>
          ))}

          {/* Mobile Cart */}
          <Link
            href="/cart"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between p-4 rounded-2xl font-bold text-slate-600 hover:bg-white transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={18} strokeWidth={2.5} />
              <span>My Cart</span>
            </div>

            {cartItemCount > 0 && (
              <span className="bg-[#FF620A] text-white px-3 py-1 rounded-full text-xs font-black shadow-sm">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* Mobile Auth */}
          {!user && (
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center p-4 text-sm font-bold text-slate-600 border-2 border-slate-200 rounded-2xl hover:border-[#007A55]/30 hover:bg-white transition-all duration-300"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center p-4 text-sm font-black bg-[#FF620A] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

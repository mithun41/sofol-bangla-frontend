"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation"; // একটিভ লিঙ্ক দেখানোর জন্য
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  ShoppingBag, // শপ আইকন
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // মোবাইল মেনু স্টেট
  const dropdownRef = useRef(null);
  const pathname = usePathname();

  // নেভিগেশন আইটেমস
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop", icon: <ShoppingBag size={18} /> },
    { name: "About", href: "/about" },
  ];

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // লিঙ্ক একটিভ আছে কিনা চেক করার ফাংশন
  const isActive = (path) => pathname === path;

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b sticky top-0 z-[100] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-10">
            <Link
              href="/"
              className="text-2xl font-black text-blue-600 tracking-tighter"
            >
              SOFOL BANGLA
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${
                    isActive(link.href)
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-blue-500"
                  }`}
                >
                  {link.icon && link.icon}
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 border border-gray-100 transition"
                >
                  <img
                    src={
                      user.profile_picture ||
                      `https://ui-avatars.com/api/?name=${user.username}&background=2563eb&color=fff`
                    }
                    alt="Profile"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                  <ChevronDown
                    size={14}
                    className={`text-gray-500 hidden sm:block transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in duration-150">
                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Signed in as
                      </p>
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {user.name}
                      </p>
                      <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase mt-1 inline-block">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      href={
                        user.role === "admin"
                          ? "/admin-dashboard"
                          : "/dashboard"
                      }
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <LayoutDashboard size={18} /> My Dashboard
                    </Link>

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition border-t border-gray-50"
                    >
                      <LogOut size={18} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-sm font-bold text-gray-600 hover:text-blue-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-blue-700 shadow-lg shadow-blue-100 transition"
                >
                  Join Now
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 md:hidden text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-2 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 p-4 rounded-xl font-bold ${
                isActive(link.href)
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              {link.icon && link.icon}
              {link.name}
            </Link>
          ))}
          {!user && (
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Link
                href="/login"
                className="text-center p-3 text-sm font-bold text-gray-600 border border-gray-100 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-center p-3 text-sm font-bold bg-blue-600 text-white rounded-xl"
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

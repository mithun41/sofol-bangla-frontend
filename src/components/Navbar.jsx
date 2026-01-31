"use client";
import React, { useState } from "react";
import { User, Menu, X } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  // লগইন অবস্থা চেক করার জন্য একটি ফেক স্টেট (পরবর্তীতে Auth দিয়ে রিপ্লেস করবেন)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ১. বামে লোগো */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold text-blue-600 tracking-tighter"
            >
              SOFOL<span className="text-gray-800 font-medium">BANGLA</span>
            </Link>
          </div>

          {/* ২. মাঝে মেনু (Desktop) */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link
              href="/"
              className="text-gray-600 hover:text-blue-600 font-medium transition"
            >
              Home
            </Link>
            <Link
              href="/courses"
              className="text-gray-600 hover:text-blue-600 font-medium transition"
            >
              Courses
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-blue-600 font-medium transition"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-blue-600 font-medium transition"
            >
              Contact
            </Link>
          </div>

          {/* ৩. ডানে বাটন বা প্রোফাইল */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700"
                >
                  My Dashboard
                </Link>
                {/* প্রোফাইল পিকচার (সার্কেল) */}
                <div className="h-10 w-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center cursor-pointer overflow-hidden">
                  <img
                    src="https://ui-avatars.com/api/?name=User"
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 p-2"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* মোবাইল মেনু ড্রপডাউন */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-3 shadow-lg">
          <Link href="/" className="block text-gray-700 font-medium">
            Home
          </Link>
          <Link href="/courses" className="block text-gray-700 font-medium">
            Courses
          </Link>
          <Link href="/login" className="block text-gray-700 font-medium">
            Sign In
          </Link>
          <Link
            href="/register"
            className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg"
          >
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}

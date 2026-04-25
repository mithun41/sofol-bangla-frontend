"use client";

import React from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f172a] text-slate-400">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="space-y-6">
          <Logo className="w-32 h-auto" />

          <p className="text-sm leading-relaxed">
            Empowering entrepreneurs across Bangladesh. We provide premium
            products and a transparent affiliate system to help you build a
            sustainable income.
          </p>

          {/* Social Icons */}
          <div className="flex space-x-5">
            <a
              href="https://www.facebook.com/share/17vdmRCa6C/"
              className="hover:text-[#FF620A] transition-all transform hover:scale-110"
            >
              <Facebook size={20} />
            </a>

            <a className="hover:text-[#FF620A] transition-all transform hover:scale-110">
              <Twitter size={20} />
            </a>

            <a className="hover:text-[#FF620A] transition-all transform hover:scale-110">
              <Instagram size={20} />
            </a>

            <a className="hover:text-[#FF620A] transition-all transform hover:scale-110">
              <Youtube size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">
            Quick Links
          </h3>

          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/about"
                className="hover:text-[#FF620A] flex items-center gap-2 group"
              >
                <ExternalLink
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
                About Us
              </Link>
            </li>

            <li>
              <Link
                href="/shop"
                className="hover:text-[#FF620A] flex items-center gap-2 group"
              >
                <ExternalLink
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
                Browse Shop
              </Link>
            </li>

            <li>
              <Link
                href="/plan"
                className="hover:text-[#FF620A] flex items-center gap-2 group"
              >
                <ExternalLink
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
                Business Plan
              </Link>
            </li>

            <li>
              <Link
                href="/faq"
                className="hover:text-[#FF620A] flex items-center gap-2 group"
              >
                <ExternalLink
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
                Help Center
              </Link>
            </li>
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">
            Legal Policies
          </h3>

          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/terms" className="hover:text-[#FF620A]">
                Terms of Service
              </Link>
            </li>

            <li>
              <Link href="/privacy" className="hover:text-[#FF620A]">
                Privacy Policy
              </Link>
            </li>

            <li>
              <Link href="/refund" className="hover:text-[#FF620A]">
                Refund Policy
              </Link>
            </li>

            <li>
              <Link href="/cookies" className="hover:text-[#FF620A]">
                Cookie Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">
            Contact Support
          </h3>

          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-[#007a55] shrink-0" />
              <span>Barisal, Bangladesh</span>
            </li>

            <li className="flex items-center gap-3">
              <Phone size={18} className="text-[#007a55] shrink-0" />
              <span>+8801710855197</span>
            </li>

            <li className="flex items-center gap-3">
              <Mail size={18} className="text-[#007a55] shrink-0" />
              <span>sofolbangla52@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800 bg-[#0a0f1d] flex items-center justify-center ">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-slate-500 tracking-wide text-center md:text-left">
            © {currentYear} Sofol Bangla Ltd. All rights reserved.
            
          </p>

          {/* Payment */}
          {/* <div className="flex items-center gap-3">
            <span className="text-[10px] border border-slate-700 px-2 py-1 rounded">
              BKASH
            </span>
            <span className="text-[10px] border border-slate-700 px-2 py-1 rounded">
              NAGAD
            </span>
            <span className="text-[10px] border border-slate-700 px-2 py-1 rounded">
              ROCKET
            </span>
          </div> */}
        </div>
      </div>
    </footer>
  );
}

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

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f172a] text-gray-400">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Column 1: Brand Identity */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Sofol <span className="text-emerald-500">Bangla</span>
          </h2>
          <p className="text-sm leading-relaxed">
            Empowering entrepreneurs across Bangladesh. We provide premium
            products and a transparent binary affiliate system to help you
            achieve financial independence.
          </p>
          <div className="flex space-x-5">
            <a
              href="#"
              className="hover:text-emerald-500 transition-all transform hover:scale-110"
            >
              <Facebook size={20} />
            </a>
            <a
              href="#"
              className="hover:text-emerald-500 transition-all transform hover:scale-110"
            >
              <Twitter size={20} />
            </a>
            <a
              href="#"
              className="hover:text-emerald-500 transition-all transform hover:scale-110"
            >
              <Instagram size={20} />
            </a>
            <a
              href="#"
              className="hover:text-emerald-500 transition-all transform hover:scale-110"
            >
              <Youtube size={20} />
            </a>
          </div>
        </div>

        {/* Column 2: Platform Links */}
        <div>
          <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">
            Quick Links
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href="/about"
                className="hover:text-emerald-500 flex items-center gap-2 group"
              >
                <ExternalLink
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />{" "}
                About Us
              </a>
            </li>
            <li>
              <Link
                href="/shop"
                className="hover:text-emerald-500 flex items-center gap-2 group"
              >
                <ExternalLink
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />{" "}
                Browse Shop
              </Link>
            </li>
            <li>
              <a
                href="/plan"
                className="hover:text-emerald-500 flex items-center gap-2 group"
              >
                <ExternalLink
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />{" "}
                Business Plan
              </a>
            </li>
            <li>
              <a
                href="/faq"
                className="hover:text-emerald-500 flex items-center gap-2 group"
              >
                <ExternalLink
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />{" "}
                Help Center
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Legal & Safety */}
        <div>
          <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">
            Legal Policies
          </h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href="/terms"
                className="hover:text-emerald-500 transition-colors"
              >
                Terms of Service
              </a>
            </li>
            <li>
              <a
                href="/privacy"
                className="hover:text-emerald-500 transition-colors"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="/refund"
                className="hover:text-emerald-500 transition-colors"
              >
                Refund Policy
              </a>
            </li>
            <li>
              <a
                href="/cookies"
                className="hover:text-emerald-500 transition-colors"
              >
                Cookie Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Get in Touch */}
        <div>
          <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">
            Contact Support
          </h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-emerald-500 shrink-0" />
              <span>Dhaka, Bangladesh</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-emerald-500 shrink-0" />
              <span>+880 1700-000000</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-emerald-500 shrink-0" />
              <span>support@sofolbangla.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="border-t border-gray-800/50 bg-[#0a0f1d]">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-gray-500 tracking-wide text-center md:text-left">
            © {currentYear} Sofol Bangla Ltd. All rights reserved. Designed for
            excellence.
          </p>
          <div className="flex items-center gap-4 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
            {/* Replace these spans with actual small icons/images of Bkash/Nagad */}
            <span className="text-[10px] border border-gray-700 px-2 py-1 rounded">
              BKASH
            </span>
            <span className="text-[10px] border border-gray-700 px-2 py-1 rounded">
              NAGAD
            </span>
            <span className="text-[10px] border border-gray-700 px-2 py-1 rounded">
              ROCKET
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

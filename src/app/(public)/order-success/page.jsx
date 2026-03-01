// src/app/order-success/page.jsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

// ১. এই কম্পোনেন্টটা সার্চ প্যারামিটার থেকে ডাটা নিবে
function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") || "N/A";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <CheckCircle size={80} className="text-emerald-500 mb-4" />
      <h1 className="text-3xl font-bold text-slate-800">Order Confirmed!</h1>
      <p className="text-slate-500 mt-2 max-w-md">
        Your order <strong>#{orderId}</strong> has been placed. We will contact
        you shortly for confirmation.
      </p>
      <Link
        href="/shop"
        className="mt-8 bg-blue-600 text-white px-10 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-colors"
      >
        Keep Shopping
      </Link>
    </div>
  );
}

// ২. মেইন এক্সপোর্ট যেটা নেক্সট জেএস বিল্ড করতে পারবে
export default function OrderSuccess() {
  return (
    // এই Suspense বাউন্ডারিটাই বিল্ড এরর ফিক্স করবে
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-slate-500 animate-pulse">
            Processing your order...
          </p>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}

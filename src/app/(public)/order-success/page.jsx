// src/app/order-success/page.jsx
"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function OrderSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <CheckCircle size={80} className="text-emerald-500 mb-4" />
      <h1 className="text-3xl font-bold text-slate-800">Order Confirmed!</h1>
      <p className="text-slate-500 mt-2 text-center max-w-md">
        Your order <strong>#{orderId}</strong> has been placed. We will contact
        you shortly for confirmation.
      </p>
      <Link
        href="/shop"
        className="mt-8 bg-blue-600 text-white px-10 py-3 rounded-full font-bold shadow-lg"
      >
        Keep Shopping
      </Link>
    </div>
  );
}

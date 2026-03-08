"use client";

import { Suspense } from "react";
import ShopContent from "./ShopContent";

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-orange-100 border-t-[#FF620A] rounded-full animate-spin" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}

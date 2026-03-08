"use client";

import { Search, SlidersHorizontal } from "lucide-react";

export default function ShopHeader({ search, setSearch, openFilter }) {
  return (
    <div className="sticky top-0 bg-white border-b border-slate-100 z-30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF620A]"
          />
        </div>

        <button
          onClick={openFilter}
          className="lg:hidden flex items-center gap-2 px-3 py-2.5 bg-[#FF620A] text-white rounded-xl text-sm font-semibold"
        >
          <SlidersHorizontal size={16} />
          Filter
        </button>
      </div>
    </div>
  );
}

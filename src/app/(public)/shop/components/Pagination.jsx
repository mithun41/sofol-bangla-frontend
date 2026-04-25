import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  // Smart page range — অনেক page থাকলে ellipsis দেখাবে
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 7) {
      // ৭ বা তার কম page হলে সব দেখাও
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // সবসময় first page
      pages.push(1);

      if (currentPage > 4) pages.push("...");

      // current page এর আশেপাশের pages
      const start = Math.max(2, currentPage - 2);
      const end = Math.min(totalPages - 1, currentPage + 2);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 3) pages.push("...");

      // সবসময় last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10 mb-4">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold border border-slate-200 bg-white text-slate-600 hover:border-[#FF620A] hover:text-[#FF620A] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all"
      >
        <ChevronLeft size={15} />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1.5">
        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm"
            >
              ···
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 rounded-xl text-sm font-bold border transition-all ${
                currentPage === page
                  ? "bg-[#FF620A] text-white border-[#FF620A] shadow-md shadow-orange-200"
                  : "bg-white border-slate-200 text-slate-600 hover:border-[#FF620A] hover:text-[#FF620A]"
              }`}
            >
              {page}
            </button>
          ),
        )}
      </div>

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold border border-slate-200 bg-white text-slate-600 hover:border-[#FF620A] hover:text-[#FF620A] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

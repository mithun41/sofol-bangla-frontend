export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-10">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-xl text-sm font-bold border transition ${
            currentPage === p
              ? "bg-[#FF620A] text-white border-[#FF620A]"
              : "bg-white border-slate-200 hover:border-[#FF620A]"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

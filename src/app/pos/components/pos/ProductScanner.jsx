import { ScanLine, Search } from "lucide-react";

export default function ProductScanner({
  barcode,
  setBarcode,
  handleScan,
  barcodeRef,
  searchQuery,
  setSearchQuery,
  searchOpen,
  searchLoading,
  searchResults,
  addToCart,
  setSearchOpen,
  playBeep,
  formatBDT,
}) {
  return (
    <div className="bg-slate-900 p-4 rounded-[2rem] flex items-center gap-4 shadow-lg shadow-slate-200">
      <div className="flex-1">
        <form onSubmit={handleScan} className="flex items-center gap-3">
          <ScanLine className="text-blue-400" size={24} />
          <input
            ref={barcodeRef}
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Scan Barcode..."
            className="bg-transparent text-white outline-none font-bold w-full"
          />
        </form>
      </div>
      <div className="w-px h-8 bg-slate-700"></div>
      <div className="flex-1 relative">
        <div className="flex items-center gap-2">
          <Search className="text-slate-500" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Product..."
            className="bg-transparent text-white outline-none font-bold w-full"
          />
        </div>
        {searchOpen && (
          <div className="absolute left-[-50%] right-0 top-full mt-4 bg-white shadow-2xl rounded-2xl border border-slate-100 z-50 max-h-80 overflow-auto">
            {searchLoading ? (
              <div className="p-6 text-center animate-pulse font-bold text-slate-400">
                Searching...
              </div>
            ) : (
              searchResults.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    addToCart(p);
                    setSearchOpen(false);
                    setSearchQuery("");
                    playBeep();
                  }}
                  className="p-4 hover:bg-blue-50 cursor-pointer border-b flex justify-between items-center"
                >
                  <div>
                    <p className="font-black text-slate-800 text-sm">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">
                      STOCK: {p.stock}
                    </p>
                  </div>
                  <span className="font-black text-blue-600">
                    {formatBDT(p.price)}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

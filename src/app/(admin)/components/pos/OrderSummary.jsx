export default function OrderSummary({
  selectedCustomer,
  dynamicSubtotal,
  handleCheckout,
  isSubmitting,
  formatBDT,
  cartLength,
}) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden sticky top-8">
      <div className="p-8 bg-slate-900 text-white">
        <h2 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-6">
          Transaction Summary
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center font-bold text-sm">
            <span className="opacity-50">Customer</span>
            <span className="text-blue-400">
              {selectedCustomer ? selectedCustomer.username : "Guest"}
            </span>
          </div>
          <div className="flex justify-between items-center font-bold text-sm">
            <span className="opacity-50">Benefit</span>
            <span
              className={
                selectedCustomer?.status === "active"
                  ? "text-green-400"
                  : "text-slate-400"
              }
            >
              {selectedCustomer?.status === "active"
                ? "2x PV Discount"
                : "Points Collection"}
            </span>
          </div>
        </div>
        <div className="mt-12">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">
            Grand Total
          </p>
          <h1 className="text-6xl font-black tracking-tighter">
            {formatBDT(dynamicSubtotal)}
          </h1>
        </div>
      </div>
      <div className="p-8 space-y-4">
        <button
          onClick={handleCheckout}
          disabled={cartLength === 0 || isSubmitting}
          className="w-full bg-blue-600 text-white font-black py-6 rounded-3xl text-lg uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? "Processing..." : "Finish Sale"}
        </button>
        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
          Tax and point calculations are processed automatically
        </p>
      </div>
    </div>
  );
}

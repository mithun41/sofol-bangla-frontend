import { ShoppingCart, Minus, Plus, Trash2, ScanLine } from "lucide-react";

export default function CartTable({
  cart,
  getEffectivePrice,
  updateQuantity,
  removeFromCart,
  clearCart,
  formatBDT,
  selectedCustomer,
}) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[500px]">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-black uppercase tracking-widest text-slate-400 text-xs flex items-center gap-2">
          <ShoppingCart size={16} /> Current Cart ({cart.length})
        </h3>
        <button
          onClick={clearCart}
          className="text-[10px] font-black text-rose-500 uppercase hover:bg-rose-50 px-4 py-2 rounded-full transition-all"
        >
          Clear Cart
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        <table className="w-full">
          <thead className="bg-slate-50/50 sticky top-0 backdrop-blur-md">
            <tr className="text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <th className="px-8 py-4">Product Details</th>
              <th className="px-8 py-4 text-center">Qty</th>
              <th className="px-8 py-4 text-right">Subtotal</th>
              <th className="px-8 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {cart.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-32 text-center opacity-20">
                  <ScanLine size={64} className="mx-auto mb-4" />
                  <p className="font-black uppercase text-2xl tracking-tighter">
                    Ready for Transaction
                  </p>
                </td>
              </tr>
            ) : (
              cart.map((item) => {
                const currentPrice = getEffectivePrice(item);
                return (
                  <tr
                    key={item.cartItemId || item.id}
                    className="group hover:bg-slate-50/30 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <p className="font-black text-slate-800 leading-tight">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-400">
                          Unit: {formatBDT(currentPrice)}
                        </span>
                        {selectedCustomer?.status === "active" && (
                          <span className="text-[8px] bg-green-100 text-green-600 px-1 rounded font-black">
                            MEMBER PRICE (-{parseFloat(item.point_value) * 2} TK
                            OFF)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex items-center justify-center gap-3 bg-slate-100 w-fit mx-auto p-1 rounded-xl">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.cartItemId, -1)
                          }
                          className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center hover:text-blue-600 transition-all"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-black text-sm w-4">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.cartItemId, 1)
                          }
                          className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center hover:text-blue-600 transition-all"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-slate-900">
                      {formatBDT(currentPrice * item.quantity)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => removeFromCart(item.id, item.cartItemId)}
                        className="p-2 text-slate-200 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

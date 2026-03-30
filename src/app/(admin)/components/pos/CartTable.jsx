"use client";

import { ShoppingCart, Minus, Plus, Trash2, ScanLine, Tag } from "lucide-react";

export default function CartTable({
  cart,
  getEffectivePrice,
  updateQuantity,
  removeFromCart,
  clearCart,
  formatBDT,
  selectedCustomer,
}) {
  const isMember = selectedCustomer?.status?.toLowerCase() === "active";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[500px]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
            <ShoppingCart size={14} />
          </div>
          <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">
            Current Cart
          </h3>
          {cart.length > 0 && (
            <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">
              {cart.length}
            </span>
          )}
          {isMember && cart.length > 0 && (
            <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Tag size={8} /> Member Discount Active
            </span>
          )}
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-[10px] font-black text-rose-400 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-all"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-y-auto flex-1">
        <table className="w-full">
          <thead className="sticky top-0 bg-white z-10 border-b border-slate-100">
            <tr className="text-left">
              <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Product
              </th>
              <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                Qty
              </th>
              <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                Unit Price
              </th>
              <th className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                Subtotal
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>

          <tbody>
            {cart.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-24 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-200">
                    <ScanLine size={48} strokeWidth={1} />
                    <p className="font-black text-xl tracking-tight text-slate-300">
                      Cart is Empty
                    </p>
                    <p className="text-xs text-slate-300 font-medium">
                      Scan a barcode or search a product to begin
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              cart.map((item) => {
                const currentPrice = getEffectivePrice(item);
                const originalPrice = parseFloat(item.price || 0);
                const hasDiscount = isMember && currentPrice < originalPrice;

                return (
                  <tr
                    key={item.cartItemId || item.id}
                    className="group hover:bg-slate-50/70 transition-colors border-b border-slate-50 last:border-0"
                  >
                    {/* Product Details */}
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 text-sm leading-tight">
                        {item.name}
                      </p>
                      {hasDiscount && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-semibold text-slate-400 line-through">
                            {formatBDT(originalPrice)}
                          </span>
                          <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-md">
                            -{parseFloat(item.point_value) * 2}৳ OFF
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Quantity Control */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1 w-fit mx-auto bg-slate-100 rounded-lg p-0.5">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.cartItemId, -1)
                          }
                          className="w-6 h-6 rounded-md bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-blue-600 hover:shadow transition-all"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="font-black text-sm text-slate-800 w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.cartItemId, 1)
                          }
                          className="w-6 h-6 rounded-md bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-blue-600 hover:shadow transition-all"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </td>

                    {/* Unit Price */}
                    <td className="px-5 py-4 text-right">
                      <span className="font-bold text-sm text-slate-600">
                        {formatBDT(currentPrice)}
                      </span>
                    </td>

                    {/* Subtotal */}
                    <td className="px-5 py-4 text-right">
                      <span className="font-black text-slate-900 text-sm">
                        {formatBDT(currentPrice * item.quantity)}
                      </span>
                    </td>

                    {/* Remove */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() =>
                          removeFromCart(item.id, item.cartItemId)
                        }
                        className="p-1.5 rounded-lg text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
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
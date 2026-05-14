import React from "react";

const ThermalInvoice = React.forwardRef(({
  orderData,
  cart,
  customer,
  meta = {},
  formatBDT,
  getEffectivePrice,
}, ref) => {
  if (!orderData || !cart?.length) return null;

  const {
    subtotal         = 0,
    discountAmount   = 0,
    payable          = 0,
    cashTendered     = 0,
    changeAmount     = 0,
    discountType,
    discountValue,
  } = meta;

  const now = new Date();

  const discountLabel = discountAmount > 0
    ? discountType === "percent"
      ? `Discount (${discountValue}%)`
      : "Discount"
    : null;

  return (
    <div 
      ref={ref} 
      className="w-[80mm] bg-white text-black font-mono text-[11px] leading-relaxed p-4 selection:bg-transparent print:w-[80mm] print:p-4 print:mx-auto"
      style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
    >
      {/* ── Store Header ── */}
      <div className="text-center mb-2.5 text-black">
        <div className="text-[16px] font-black uppercase tracking-wider text-black">
          Sofol Bangla Shop
        </div>
        <div className="text-[9.5px] font-bold text-black">
          Road-12, Sector-07, Uttara, Dhaka
        </div>
        <div className="text-[9.5px] font-bold text-black">
          Phone: 017XXXXXXXX
        </div>
        <div className="border-t border-dashed border-black my-1.5" />
        <div className="text-[12px] font-black tracking-widest text-black">
          CASH MEMO
        </div>
      </div>

      {/* ── Order Info ── */}
      <div className="mb-1 flex flex-col gap-0.5 text-[10px] font-bold text-black">
        <div className="flex justify-between text-black">
          <span className="text-black">Order #: {orderData.id || orderData.order_id}</span>
          <span className="text-black">{now.toLocaleDateString("en-BD")}</span>
        </div>
        <div className="flex justify-between text-black">
          <span className="text-black">Time: {now.toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}</span>
          <span className="text-black">{customer?.status?.toUpperCase()}</span>
        </div>
        <div className="text-black">
          Customer: {customer?.name || customer?.username || "Guest"}
        </div>
        {customer?.phone && (
          <div className="text-black">Phone: {customer.phone}</div>
        )}
      </div>

      <div className="border-t border-dashed border-black my-1.5" />

      {/* ── Table Header ── */}
      <div className="flex text-[10px] font-black text-black mb-0.5">
        <div className="flex-1 pr-1 text-black">ITEM</div>
        <div className="w-[22px] text-center text-black shrink-0">QTY</div>
        <div className="w-[38px] text-right text-black shrink-0">RATE</div>
        <div className="w-[44px] text-right text-black shrink-0">AMT</div>
      </div>
      
      <div className="border-t border-dashed border-black my-1.5" />

      {/* ── Line Items ── */}
      <div className="flex flex-col gap-1 text-black">
        {cart.map((item, idx) => {
          const unitPrice  = getEffectivePrice ? getEffectivePrice(item) : Number(item.price || 0);
          const itemTotal  = unitPrice * item.quantity;
          const origPrice  = Number(item.price || 0);
          const hasDisc    = customer?.status?.toLowerCase() === "active" && unitPrice < origPrice;

          return (
            <div key={idx} className="flex text-[10px] font-bold text-black items-start">
              <div className="flex-1 pr-1 break-all text-black">
                <span className="text-black">{item.name}</span>
                {hasDisc && (
                  <span className="block text-[8px] font-black mt-0.5 text-black">
                    MRP: {Number(origPrice).toFixed(0)} | Disc: {(origPrice - unitPrice).toFixed(0)} off
                  </span>
                )}
              </div>
              <div className="w-[22px] text-center text-black shrink-0">{item.quantity}</div>
              <div className="w-[38px] text-right text-black shrink-0">{Number(unitPrice).toFixed(0)}</div>
              <div className="w-[44px] text-right font-black text-black shrink-0">{Number(itemTotal).toFixed(0)}</div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-dashed border-black mt-2 mb-1.5" />

      {/* ── Totals ── */}
      <div className="flex flex-col gap-1 text-[10.5px] font-bold text-black">
        {/* MRP subtotal */}
        {meta.totalMemberSavings > 0 && (
          <div className="flex justify-between text-[9.5px] text-black font-black">
            <span>MRP Total:</span>
            <span>{formatBDT(subtotal + (meta.totalMemberSavings || 0))}</span>
          </div>
        )}

        {/* Member discount */}
        {meta.totalMemberSavings > 0 && (
          <div className="flex justify-between font-black text-black">
            <span>★ Member Discount:</span>
            <span>- {formatBDT(meta.totalMemberSavings)}</span>
          </div>
        )}

        <div className="flex justify-between text-black">
          <span>Subtotal:</span>
          <span>{formatBDT(subtotal)}</span>
        </div>

        {/* Manual discount */}
        {discountAmount > 0 && (
          <div className="flex justify-between font-black text-black">
            <span>{discountLabel}:</span>
            <span>- {formatBDT(discountAmount)}</span>
          </div>
        )}

        {/* Grand Total */}
        <div className="flex justify-between font-black text-[14px] border-t-2 border-b border-black my-1 py-1 text-black">
          <span>NET PAYABLE</span>
          <span>{formatBDT(payable)}</span>
        </div>

        {cashTendered > 0 && (
          <>
            <div className="flex justify-between text-black">
              <span>Cash Received:</span>
              <span>{formatBDT(cashTendered)}</span>
            </div>
            <div className="flex justify-between font-black text-black">
              <span>Change:</span>
              <span>{formatBDT(changeAmount)}</span>
            </div>
          </>
        )}

        <div className="flex justify-between text-[10px] mt-0.5 text-black">
          <span>Payment:</span>
          <span>{(orderData.payment_method || "CASH").toUpperCase()}</span>
        </div>
      </div>

      {/* ── Savings summary ── */}
      {(meta.totalMemberSavings > 0 || discountAmount > 0) && (
        <div className="border border-black mt-2.5 p-1 text-black">
          <div className="font-black text-center mb-0.5 text-black">
            🎁 আপনি সাশ্রয় করেছেন
          </div>
          {meta.totalMemberSavings > 0 && (
            <div className="flex justify-between font-bold text-black">
              <span>Member Discount:</span>
              <span>{formatBDT(meta.totalMemberSavings)}</span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="flex justify-between font-bold text-black">
              <span>Special Discount:</span>
              <span>{formatBDT(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-[12px] border-t border-dashed border-black mt-1 pt-1 text-black">
            <span>TOTAL SAVINGS:</span>
            <span>{formatBDT((meta.totalMemberSavings || 0) + discountAmount)}</span>
          </div>
        </div>
      )}

      {/* ── Points earned ── */}
      {Number(orderData.added_points) > 0 && (
        <div className="mt-2 text-center border border-black border-dashed rounded-[2px] p-1 text-[10px] font-black text-black">
          🎯 Points Earned: +{Number(orderData.added_points).toFixed(0)} PV
        </div>
      )}

      {/* ── Footer ── */}
      <div className="text-center mt-2 text-black">
        <div className="border-t border-dashed border-black mt-2 mb-1.5" />
        <div className="text-[12px] font-black text-black">ধন্যবাদ! আবার আসবেন</div>
        <div className="text-[9px] mt-0.5 font-black text-black">পণ্য বিক্রয়ের পরে ফেরত নেওয়া হয় না।</div>
        <div className="text-[8px] mt-1 font-bold text-black">Sofol Bangla — sofolbangla.com</div>
      </div>
    </div>
  );
});

ThermalInvoice.displayName = "ThermalInvoice";
export default ThermalInvoice;
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
      style={{
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
        width: "80mm",
        background: "#fff",
        color: "#000",
        fontSize: "11px",
        lineHeight: "1.5",
        padding: "6mm 4mm",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {/* Store Header */}
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <div style={{ fontSize: "16px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Sofol Bangla Shop
        </div>
        <div style={{ fontSize: "9.5px", fontWeight: "bold" }}>Road-12, Sector-07, Uttara, Dhaka</div>
        <div style={{ fontSize: "9.5px", fontWeight: "bold" }}>Phone: 017XXXXXXXX</div>
        <div style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />
        <div style={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.1em" }}>CASH MEMO</div>
      </div>

      {/* Order Info */}
      <div style={{ marginBottom: "4px", fontSize: "10px", fontWeight: "bold" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Order #: {orderData.id || orderData.order_id}</span>
          <span>{now.toLocaleDateString("en-GB")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Time: {now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
          <span>{customer?.status?.toUpperCase()}</span>
        </div>
        <div>Customer: {customer?.name || customer?.username || "Guest"}</div>
        {customer?.phone && <div>Phone: {customer.phone}</div>}
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />

      {/* Table Header */}
      <div style={{ display: "flex", fontSize: "10px", fontWeight: 900, marginBottom: "3px" }}>
        <div style={{ flex: 1, paddingRight: "3px" }}>ITEM</div>
        <div style={{ width: "22px", textAlign: "center", flexShrink: 0 }}>QTY</div>
        <div style={{ width: "38px", textAlign: "right", flexShrink: 0 }}>RATE</div>
        <div style={{ width: "44px", textAlign: "right", flexShrink: 0 }}>AMT</div>
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />

      {/* Line Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {cart.map((item, idx) => {
          const unitPrice = getEffectivePrice ? getEffectivePrice(item) : Number(item.price || 0);
          const itemTotal = unitPrice * item.quantity;
          const origPrice = Number(item.price || 0);
          const hasDisc   = customer?.status?.toLowerCase() === "active" && unitPrice < origPrice;

          return (
            <div key={idx} style={{ display: "flex", fontSize: "10px", fontWeight: "bold", alignItems: "flex-start" }}>
              <div style={{ flex: 1, paddingRight: "3px", wordBreak: "break-word" }}>
                <span>{item.name}</span>
                {hasDisc && (
                  <span style={{ display: "block", fontSize: "8px", fontWeight: 900, marginTop: "1px", fontStyle: "italic" }}>
                    MRP: {Number(origPrice).toFixed(0)} | Disc: {(origPrice - unitPrice).toFixed(0)} off
                  </span>
                )}
              </div>
              <div style={{ width: "22px", textAlign: "center", flexShrink: 0 }}>{item.quantity}</div>
              <div style={{ width: "38px", textAlign: "right", flexShrink: 0 }}>{Number(unitPrice).toFixed(0)}</div>
              <div style={{ width: "44px", textAlign: "right", fontWeight: 900, flexShrink: 0 }}>{Number(itemTotal).toFixed(0)}</div>
            </div>
          );
        })}
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "8px 0 5px" }} />

      {/* Totals */}
      <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "10.5px", fontWeight: "bold" }}>
        {meta.totalMemberSavings > 0 && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5px", fontWeight: 900 }}>
              <span>MRP Total:</span>
              <span>{formatBDT(subtotal + (meta.totalMemberSavings || 0))}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900 }}>
              <span>* Member Discount:</span>
              <span>- {formatBDT(meta.totalMemberSavings)}</span>
            </div>
          </>
        )}

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Subtotal:</span>
          <span>{formatBDT(subtotal)}</span>
        </div>

        {discountAmount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900 }}>
            <span>{discountLabel}:</span>
            <span>- {formatBDT(discountAmount)}</span>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: "14px", borderTop: "2px solid #000", borderBottom: "1px solid #000", margin: "4px 0", padding: "3px 0" }}>
          <span>NET PAYABLE</span>
          <span>{formatBDT(payable)}</span>
        </div>

        {cashTendered > 0 && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Cash Received:</span>
              <span>{formatBDT(cashTendered)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900 }}>
              <span>Change:</span>
              <span>{formatBDT(changeAmount)}</span>
            </div>
          </>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginTop: "2px" }}>
          <span>Payment:</span>
          <span>{(orderData.payment_method || "CASH").toUpperCase()}</span>
        </div>
      </div>

      {/* Savings summary */}
      {(meta.totalMemberSavings > 0 || discountAmount > 0) && (
        <div style={{ border: "1px solid #000", marginTop: "8px", padding: "5px" }}>
          <div style={{ fontWeight: 900, textAlign: "center", marginBottom: "3px" }}>
            You Saved Today!
          </div>
          {meta.totalMemberSavings > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
              <span>Member Discount:</span>
              <span>{formatBDT(meta.totalMemberSavings)}</span>
            </div>
          )}
          {discountAmount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
              <span>Special Discount:</span>
              <span>{formatBDT(discountAmount)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: "12px", borderTop: "1px dashed #000", marginTop: "4px", paddingTop: "4px" }}>
            <span>TOTAL SAVINGS:</span>
            <span>{formatBDT((meta.totalMemberSavings || 0) + discountAmount)}</span>
          </div>
        </div>
      )}

      {/* Points earned */}
      {Number(orderData.added_points) > 0 && (
        <div style={{ marginTop: "8px", textAlign: "center", border: "1px dashed #000", padding: "4px", fontSize: "10px", fontWeight: 900 }}>
          Points Earned: +{Number(orderData.added_points).toFixed(0)} PV
        </div>
      )}

      {/* Footer — বাংলা সরানো হয়েছে, English করা হয়েছে */}
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <div style={{ borderTop: "1px dashed #000", marginBottom: "6px" }} />
        <div style={{ fontSize: "13px", fontWeight: 900 }}>Thank You! Please Visit Again</div>
        <div style={{ fontSize: "9px", marginTop: "2px", fontWeight: "bold" }}>Goods once sold are not returnable.</div>
        <div style={{ fontSize: "8px", marginTop: "5px", fontStyle: "italic", opacity: 0.5 }}>Sofol Bangla — sofolbangla.com</div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: 80mm auto; margin: 0; }
          body { margin: 0; padding: 0; background: #fff; }
        }
      ` }} />
    </div>
  );
});

ThermalInvoice.displayName = "ThermalInvoice";
export default ThermalInvoice;
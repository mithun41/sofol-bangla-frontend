import React from "react";

const ThermalInvoice = React.forwardRef(
  (
    {
      orderData,
      cart,
      customer,
      subtotal,
      formatBDT,
      getEffectivePrice,
    },
    ref
  ) => {
    if (!orderData) return null;

    const vatPercent = 0;
    const vatAmount = subtotal * (vatPercent / 100);
    const grandTotal = subtotal + vatAmount;
    const now = new Date();

    return (
      <div
        ref={ref}
        className="thermal-invoice-container"
      >
        {/* ── Store Header ── */}
        <div className="inv-header">
          <div className="inv-store-name">Sofol Bangla Shop</div>
          <div className="inv-store-meta">Road-12, Sector-07, Uttara, Dhaka</div>
          <div className="inv-store-meta">BIN: 001234567-0101</div>
          <div className="inv-store-meta">Phone: 017XXXXXXXX</div>
          <div className="inv-divider-dashed" />
          <div className="inv-title">CASH MEMO</div>
        </div>

        {/* ── Order Info ── */}
        <div className="inv-meta-block">
          <div className="inv-meta-row">
            <span>Order: #{orderData.id || orderData.order_id}</span>
            <span>{now.toLocaleDateString("en-BD")}</span>
          </div>
          <div className="inv-meta-line">Time: {now.toLocaleTimeString("en-BD")}</div>
          <div className="inv-meta-line">
            Customer: {customer?.name || customer?.username || "Guest Customer"}
          </div>
          {customer?.phone && (
            <div className="inv-meta-line">Phone: {customer.phone}</div>
          )}
        </div>

        <div className="inv-divider-dashed" />

        {/* ── Table Header ── */}
        <div className="inv-table-head">
          <div className="col-item">ITEM</div>
          <div className="col-qty">QTY</div>
          <div className="col-price">PRICE</div>
          <div className="col-total">TOTAL</div>
        </div>
        <div className="inv-divider-dashed" />

        {/* ── Line Items ── */}
        <div className="inv-items">
          {cart.map((item, index) => {
            const unitPrice = getEffectivePrice
              ? getEffectivePrice(item)
              : item.price || 0;
            const itemTotal = unitPrice * item.quantity;

            return (
              <div key={index} className="inv-item-row">
                <div className="col-item">
                  <span>{item.name}</span>
                  {customer?.status === "active" && (
                    <span className="inv-member-tag">(Member Disc.)</span>
                  )}
                </div>
                <div className="col-qty">{item.quantity}</div>
                <div className="col-price">{Number(unitPrice).toFixed(0)}</div>
                <div className="col-total">{Number(itemTotal).toFixed(0)}</div>
              </div>
            );
          })}
        </div>

        <div className="inv-divider-dashed inv-divider-mt" />

        {/* ── Totals ── */}
        <div className="inv-totals">
          <div className="inv-total-row">
            <span>Subtotal:</span>
            <span>{formatBDT(subtotal)}</span>
          </div>
          {vatAmount > 0 && (
            <div className="inv-total-row">
              <span>VAT ({vatPercent}%):</span>
              <span>{formatBDT(vatAmount)}</span>
            </div>
          )}
          <div className="inv-grand-total">
            <span>GRAND TOTAL</span>
            <span>{formatBDT(grandTotal)}</span>
          </div>
          <div className="inv-payment-row">
            <span>Paid Via:</span>
            <span>{(orderData.payment_method || "Cash").toUpperCase()}</span>
          </div>
        </div>

        {/* ── Points earned ── */}
        {orderData.added_points > 0 && (
          <div className="inv-points-box">
            Points Earned: {orderData.added_points}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="inv-footer">
          <div className="inv-divider-dashed inv-divider-mt" />
          <div className="inv-thanks">Thank You!</div>
          <div className="inv-footer-note">Goods sold are not returnable.</div>
          <div className="inv-dev-note">Developed by: Mithun / Sofol Bangla</div>
        </div>

        {/* ── Styles ── */}
        <style dangerouslySetInnerHTML={{ __html: `
          .thermal-invoice-container {
            width: 80mm;
            padding: 6mm 4mm;
            background: #fff;
            color: #000;
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            line-height: 1.45;
          }

          /* Header */
          .inv-header { text-align: center; margin-bottom: 10px; }
          .inv-store-name { font-size: 15px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; }
          .inv-store-meta { font-size: 9.5px; }
          .inv-title { font-size: 12px; font-weight: 700; margin-top: 2px; }

          /* Divider */
          .inv-divider-dashed {
            border: none;
            border-top: 1px dashed #000;
            margin: 6px 0;
          }
          .inv-divider-mt { margin-top: 10px; }

          /* Meta block */
          .inv-meta-block { margin-bottom: 6px; }
          .inv-meta-row { display: flex; justify-content: space-between; font-size: 10px; }
          .inv-meta-line { font-size: 10px; }

          /* Table */
          .inv-table-head,
          .inv-item-row {
            display: flex;
            font-size: 10px;
            align-items: flex-start;
          }
          .inv-table-head { font-weight: 700; margin-bottom: 2px; }

          .col-item  { flex: 1; padding-right: 4px; word-break: break-word; }
          .col-qty   { width: 22px; text-align: center; flex-shrink: 0; }
          .col-price { width: 40px; text-align: right; flex-shrink: 0; }
          .col-total { width: 46px; text-align: right; flex-shrink: 0; font-weight: 700; }

          .inv-items { display: flex; flex-direction: column; gap: 4px; }
          .inv-member-tag { display: block; font-size: 8px; font-style: italic; opacity: 0.6; }

          /* Totals */
          .inv-totals { display: flex; flex-direction: column; gap: 3px; font-size: 10px; }
          .inv-total-row { display: flex; justify-content: space-between; }
          .inv-grand-total {
            display: flex;
            justify-content: space-between;
            font-weight: 900;
            font-size: 13px;
            border-top: 1px solid #000;
            margin-top: 4px;
            padding-top: 4px;
          }
          .inv-payment-row {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            margin-top: 4px;
          }

          /* Points */
          .inv-points-box {
            margin-top: 8px;
            text-align: center;
            border: 1px solid #000;
            border-radius: 3px;
            padding: 4px;
            font-size: 10px;
            font-weight: 700;
          }

          /* Footer */
          .inv-footer { text-align: center; margin-top: 10px; }
          .inv-thanks { font-size: 13px; font-weight: 900; }
          .inv-footer-note { font-size: 9px; margin-top: 2px; }
          .inv-dev-note { font-size: 8px; margin-top: 6px; font-style: italic; opacity: 0.45; }

          /* Print overrides */
          @media print {
            @page { size: 80mm auto; margin: 0; }
            body { margin: 0; padding: 0; background: #fff; }
            .thermal-invoice-container {
              width: 80mm;
              padding: 8mm 4mm;
              margin: 0 auto;
            }
          }
        ` }} />
      </div>
    );
  }
);

ThermalInvoice.displayName = "ThermalInvoice";
export default ThermalInvoice;
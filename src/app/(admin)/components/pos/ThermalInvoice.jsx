import React from "react";

/**
 * ThermalInvoice
 *
 * 80mm thermal receipt with full breakdown:
 * - Member savings per line item
 * - Manual discount
 * - Exchange credit (if any)
 * - Points earned
 * - Offer summary section
 */
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
    subtotal            = 0,
    discountAmount      = 0,
    payable             = 0,
    cashTendered        = 0,
    changeAmount        = 0,
    discountType,
    discountValue,
    totalMemberSavings  = 0,
    exchangeCredit      = 0,
    exchangeItems       = [],
    exchangeOrderRef    = null,
    customerStatus      = "",
  } = meta;

  const isActiveMember = customerStatus?.toLowerCase() === "active";
  const now = new Date();

  const discountLabel = discountAmount > 0
    ? discountType === "percent"
      ? `Special Discount (${discountValue}%)`
      : "Special Discount"
    : null;

  // Total savings = member savings + manual discount + exchange credit
  const totalSavings = totalMemberSavings + discountAmount + exchangeCredit;

  const addedPoints = Number(orderData.added_points || 0);

  return (
    <div ref={ref} className="thermal-invoice-container">

      {/* ── Store Header ── */}
      <div className="inv-header">
        <div className="inv-store-name">Sofol Bangla Shop</div>
        <div className="inv-store-meta">Road-12, Sector-07, Uttara, Dhaka</div>
        <div className="inv-store-meta">Phone: 017XXXXXXXX</div>
        <div className="inv-divider-dashed" />
        <div className="inv-title">CASH MEMO</div>
      </div>

      {/* ── Order Info ── */}
      <div className="inv-meta-block">
        <div className="inv-meta-row">
          <span>Order #: {orderData.id || orderData.order_id}</span>
          <span>{now.toLocaleDateString("en-BD")}</span>
        </div>
        <div className="inv-meta-row">
          <span>Time: {now.toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}</span>
          <span className="inv-badge">{isActiveMember ? "★ MEMBER" : "GUEST"}</span>
        </div>
        <div className="inv-meta-line">
          Customer: {customer?.name || customer?.username || "Guest"}
        </div>
        {customer?.phone && (
          <div className="inv-meta-line">Phone: {customer.phone}</div>
        )}
        {exchangeOrderRef && (
          <div className="inv-meta-line inv-exchange-ref">
            Exchange Ref: Order #{exchangeOrderRef}
          </div>
        )}
      </div>

      <div className="inv-divider-dashed" />

      {/* ── Table Header ── */}
      <div className="inv-table-head">
        <div className="col-item">ITEM</div>
        <div className="col-qty">QTY</div>
        <div className="col-price">RATE</div>
        <div className="col-total">AMT</div>
      </div>
      <div className="inv-divider-dashed" />

      {/* ── Line Items ── */}
      <div className="inv-items">
        {cart.map((item, idx) => {
          const unitPrice  = getEffectivePrice ? getEffectivePrice(item) : Number(item.price || 0);
          const itemTotal  = unitPrice * item.quantity;
          const origPrice  = Number(item.price || 0);
          const pv         = Number(item.point_value || 0);
          const saving     = isActiveMember && pv > 0 ? pv * 2 : 0;
          const hasDisc    = saving > 0;

          return (
            <div key={idx} className="inv-item-row">
              <div className="col-item">
                <span>{item.name}</span>
                {hasDisc && (
                  <span className="inv-member-tag">
                    MRP ৳{origPrice.toFixed(0)} | Save ৳{saving.toFixed(0)}/unit
                  </span>
                )}
              </div>
              <div className="col-qty">{item.quantity}</div>
              <div className="col-price">{unitPrice.toFixed(0)}</div>
              <div className="col-total">{itemTotal.toFixed(0)}</div>
            </div>
          );
        })}
      </div>

      {/* ── Returned items (exchange) ── */}
      {exchangeItems && exchangeItems.length > 0 && (
        <>
          <div className="inv-divider-dashed inv-divider-mt" />
          <div className="inv-exchange-header">RETURNED ITEMS</div>
          <div className="inv-items">
            {exchangeItems.map((item, idx) => (
              <div key={idx} className="inv-item-row inv-return-row">
                <div className="col-item">{item.product_name}</div>
                <div className="col-qty">{item.quantity}</div>
                <div className="col-price">{Number(item.price).toFixed(0)}</div>
                <div className="col-total">-{(item.quantity * item.price).toFixed(0)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="inv-divider-dashed inv-divider-mt" />

      {/* ── Totals ── */}
      <div className="inv-totals">
        {/* Original subtotal (pre-member-discount) */}
        {totalMemberSavings > 0 && (
          <div className="inv-total-row inv-mrp-row">
            <span>MRP Total:</span>
            <span>{formatBDT(subtotal + totalMemberSavings)}</span>
          </div>
        )}

        <div className="inv-total-row">
          <span>Subtotal:</span>
          <span>{formatBDT(subtotal)}</span>
        </div>

        {/* Member discount savings */}
        {totalMemberSavings > 0 && (
          <div className="inv-total-row inv-offer-row">
            <span>★ Member Discount:</span>
            <span>- {formatBDT(totalMemberSavings)}</span>
          </div>
        )}

        {/* Manual discount */}
        {discountAmount > 0 && (
          <div className="inv-total-row inv-offer-row">
            <span>{discountLabel}:</span>
            <span>- {formatBDT(discountAmount)}</span>
          </div>
        )}

        {/* Exchange credit */}
        {exchangeCredit > 0 && (
          <div className="inv-total-row inv-offer-row">
            <span>Exchange Credit:</span>
            <span>- {formatBDT(exchangeCredit)}</span>
          </div>
        )}

        {/* Grand total */}
        <div className="inv-grand-total">
          <span>NET PAYABLE</span>
          <span>{formatBDT(payable)}</span>
        </div>

        {cashTendered > 0 && (
          <>
            <div className="inv-total-row">
              <span>Cash Received:</span>
              <span>{formatBDT(cashTendered)}</span>
            </div>
            <div className="inv-total-row inv-change-row">
              <span>Change:</span>
              <span>{formatBDT(changeAmount)}</span>
            </div>
          </>
        )}

        <div className="inv-payment-row">
          <span>Payment:</span>
          <span>{(orderData.payment_method || "CASH").toUpperCase()}</span>
        </div>
      </div>

      {/* ── Savings Summary Box ── */}
      {totalSavings > 0 && (
        <div className="inv-savings-box">
          <div className="inv-savings-title">🎁 আপনি সাশ্রয় করেছেন</div>
          {totalMemberSavings > 0 && (
            <div className="inv-savings-row">
              <span>Member Discount:</span>
              <span>{formatBDT(totalMemberSavings)}</span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="inv-savings-row">
              <span>Special Discount:</span>
              <span>{formatBDT(discountAmount)}</span>
            </div>
          )}
          {exchangeCredit > 0 && (
            <div className="inv-savings-row">
              <span>Exchange Credit:</span>
              <span>{formatBDT(exchangeCredit)}</span>
            </div>
          )}
          <div className="inv-savings-total">
            <span>TOTAL SAVINGS:</span>
            <span>{formatBDT(totalSavings)}</span>
          </div>
        </div>
      )}

      {/* ── Points earned ── */}
      {addedPoints > 0 && (
        <div className="inv-points-box">
          🎯 Points Earned: +{addedPoints.toFixed(0)} PV
          <div className="inv-points-note">আপনার অ্যাকাউন্টে যোগ হয়েছে</div>
        </div>
      )}

      {/* ── Member offer note ── */}
      {isActiveMember && (
        <div className="inv-member-note">
          ★ Active Member — সদস্য মূল্যে কেনাকাটা করেছেন
        </div>
      )}

      {/* ── Footer ── */}
      <div className="inv-footer">
        <div className="inv-divider-dashed inv-divider-mt" />
        <div className="inv-thanks">Thank You! আসবেন আবার 🙏</div>
        <div className="inv-footer-note">পণ্য বিক্রয়ের পরে ফেরত নেওয়া হয় না।</div>
        <div className="inv-dev-note">Sofol Bangla — sofolbangla.com</div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .thermal-invoice-container {
          width: 80mm;
          padding: 6mm 4mm;
          background: #fff;
          color: #000;
          font-family: 'Courier New', Courier, monospace;
          font-size: 11px;
          line-height: 1.5;
        }
        .inv-header { text-align: center; margin-bottom: 10px; }
        .inv-store-name { font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em; }
        .inv-store-meta { font-size: 9.5px; }
        .inv-title { font-size: 12px; font-weight: 700; margin-top: 3px; letter-spacing: 0.1em; }
        .inv-badge { font-size: 9px; font-weight: 700; background: #000; color: #fff; padding: 1px 4px; border-radius: 2px; }
        .inv-divider-dashed { border: none; border-top: 1px dashed #000; margin: 5px 0; }
        .inv-divider-mt { margin-top: 8px; }
        .inv-meta-block { margin-bottom: 4px; }
        .inv-meta-row { display: flex; justify-content: space-between; font-size: 10px; }
        .inv-meta-line { font-size: 10px; }
        .inv-exchange-ref { font-style: italic; font-size: 9px; opacity: 0.7; }
        .inv-table-head, .inv-item-row { display: flex; font-size: 10px; align-items: flex-start; }
        .inv-table-head { font-weight: 700; margin-bottom: 2px; }
        .col-item  { flex: 1; padding-right: 3px; word-break: break-word; }
        .col-qty   { width: 22px; text-align: center; flex-shrink: 0; }
        .col-price { width: 38px; text-align: right; flex-shrink: 0; }
        .col-total { width: 44px; text-align: right; flex-shrink: 0; font-weight: 700; }
        .inv-items { display: flex; flex-direction: column; gap: 4px; }
        .inv-member-tag { display: block; font-size: 8px; font-style: italic; opacity: 0.6; margin-top: 1px; }
        .inv-exchange-header { font-size: 9px; font-weight: 700; text-align: center; letter-spacing: 0.08em; margin: 4px 0 3px; }
        .inv-return-row { opacity: 0.7; font-style: italic; }
        .inv-totals { display: flex; flex-direction: column; gap: 3px; font-size: 10.5px; }
        .inv-total-row { display: flex; justify-content: space-between; }
        .inv-mrp-row { opacity: 0.5; font-size: 9.5px; text-decoration: line-through; }
        .inv-offer-row { font-style: italic; font-weight: 700; }
        .inv-change-row { font-weight: 700; }
        .inv-grand-total {
          display: flex; justify-content: space-between;
          font-weight: 900; font-size: 14px;
          border-top: 1.5px solid #000; border-bottom: 1px solid #000;
          margin: 4px 0; padding: 3px 0;
        }
        .inv-payment-row { display: flex; justify-content: space-between; font-size: 10px; margin-top: 3px; }

        /* Savings summary */
        .inv-savings-box {
          margin-top: 8px;
          border: 1px solid #000;
          border-radius: 2px;
          padding: 5px 6px;
          font-size: 10px;
        }
        .inv-savings-title { font-weight: 900; font-size: 11px; text-align: center; margin-bottom: 4px; }
        .inv-savings-row { display: flex; justify-content: space-between; }
        .inv-savings-total {
          display: flex; justify-content: space-between;
          font-weight: 900; font-size: 12px;
          border-top: 1px dashed #000; margin-top: 4px; padding-top: 3px;
        }

        /* Points */
        .inv-points-box {
          margin-top: 8px; text-align: center;
          border: 1px dashed #000; border-radius: 2px;
          padding: 5px; font-size: 10px; font-weight: 700;
        }
        .inv-points-note { font-size: 8px; font-weight: 400; font-style: italic; margin-top: 2px; }

        /* Member note */
        .inv-member-note {
          margin-top: 6px; text-align: center;
          font-size: 8.5px; font-style: italic; opacity: 0.7;
        }

        /* Footer */
        .inv-footer { text-align: center; margin-top: 8px; }
        .inv-thanks { font-size: 12px; font-weight: 900; }
        .inv-footer-note { font-size: 9px; margin-top: 2px; }
        .inv-dev-note { font-size: 8px; margin-top: 5px; font-style: italic; opacity: 0.4; }

        @media print {
          @page { size: 80mm auto; margin: 0; }
          body { margin: 0; padding: 0; background: #fff; }
          .thermal-invoice-container { width: 80mm; padding: 8mm 4mm; margin: 0 auto; }
        }
      ` }} />
    </div>
  );
});

ThermalInvoice.displayName = "ThermalInvoice";
export default ThermalInvoice;
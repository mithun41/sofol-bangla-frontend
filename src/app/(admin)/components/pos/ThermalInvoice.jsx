import React from "react";

const ThermalInvoice = React.forwardRef(
  ({ orderData, cart, customer, subtotal, formatBDT }, ref) => {
    if (!orderData) return null;

    const vatPercent = 0; // তোর ভ্যাট পারসেন্টেজ
    const vatAmount = subtotal * (vatPercent / 100);
    const grandTotal = subtotal + vatAmount;

    return (
      <div
        ref={ref}
        className="print-only p-4 text-black font-mono text-[12px] w-[80mm] leading-tight"
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold uppercase">Sofol Bangla Shop</h2>
          <p>Road-12, Sector-07, Uttara, Dhaka</p>
          <p>Bin: 001234567-0101</p>
          <p>Phone: 017XXXXXXXX</p>
          <div className="border-b border-dashed border-black my-2"></div>
          <p className="font-bold">CASH MEMO</p>
        </div>

        {/* Order Info */}
        <div className="mb-2">
          <p>Date: {new Date().toLocaleString()}</p>
          <p>Cust: {customer?.username || "Guest"}</p>
          <p>Phone: {customer?.phone || "N/A"}</p>
        </div>

        <div className="border-b border-dashed border-black my-2"></div>

        {/* Table Header */}
        <div className="flex font-bold mb-1">
          <div className="w-[45%] text-left">Item</div>
          <div className="w-[15%] text-center">Qty</div>
          <div className="w-[20%] text-right">Price</div>
          <div className="w-[20%] text-right">Total</div>
        </div>
        <div className="border-b border-dashed border-black mb-2"></div>

        {/* Items */}
        {cart.map((item, index) => (
          <div key={index} className="flex mb-1">
            <div className="w-[45%] truncate">{item.name}</div>
            <div className="w-[15%] text-center">{item.quantity}</div>
            <div className="w-[20%] text-right">{item.price.toFixed(0)}</div>
            <div className="w-[20%] text-right">
              {(item.price * item.quantity).toFixed(0)}
            </div>
          </div>
        ))}

        <div className="border-b border-dashed border-black my-2"></div>

        {/* Calculation */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatBDT(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>VAT ({vatPercent}%):</span>
            <span>{formatBDT(vatAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm border-t border-black pt-1">
            <span>GRAND TOTAL:</span>
            <span>{formatBDT(grandTotal)}</span>
          </div>
        </div>

        <div className="border-b border-dashed border-black my-2"></div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="font-bold">Thank You!</p>
          <p>Please visit again.</p>
          <p className="text-[10px] mt-2 italic">Software by: Sofol Bangla</p>
        </div>

        {/* Print Specific CSS */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .print-only { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 80mm; 
          }
          @page { size: 80mm auto; margin: 0; }
        }
      `,
          }}
        />
      </div>
    );
  },
);

ThermalInvoice.displayName = "ThermalInvoice";
export default ThermalInvoice;

import React from "react";

const ShippingLabel = React.forwardRef(({ order }, ref) => {
  if (!order) return null;

  return (
    <div
      ref={ref}
      style={{ width: "150mm", minHeight: "150mm" }}
      className="p-6 bg-white border-[3px] border-black text-black font-sans m-2"
    >
      {/* Header Section */}
      <div className="border-b-[3px] border-black pb-3 mb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter leading-none text-black">
            Shipping Label
          </h1>
          <p className="text-[10px] font-bold mt-1 tracking-widest uppercase opacity-70 text-black">
            Sofolbangala
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase leading-none text-black">
            Order ID
          </p>
          <p className="text-lg font-black italic text-black">
            #{order.order_number}
          </p>
        </div>
      </div>

      {/* Courier Info */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase bg-black text-white px-1.5 py-0.5 inline-block mb-1">
            Courier Partner
          </p>
          <p className="text-xl font-black border-b-2 border-dotted border-black pb-1 text-black">
            {order.courier || "N/A"}
          </p>
        </div>
      </div>

      {/* Customer Info Section */}
      <div className="space-y-5 mb-8">
        <div>
          <p className="text-[11px] font-black uppercase mb-1 text-black">
            Recipient:
          </p>
          <p className="text-2xl font-black leading-none  mb-1 text-black">
           Name :  {order.name}
          </p>
          <p className="text-xl font-black flex items-center gap-2 tracking-wider text-black">
            Mobile No : {order.phone}
          </p>
        </div>

        <div className="border-t-2 border-black pt-3">
          <p className="text-[11px] font-black uppercase mb-1 text-black">
            Delivery Address:
          </p>
          <p className="text-base font-bold leading-tight text-black">
            {order.address}
          </p>
          <p className="text-lg font-black mt-1 uppercase italic text-black">
            {order.city}
          </p>
        </div>
      </div>

      {/* Billing Summary */}
      <div className="border-[3px] border-black overflow-hidden rounded-xl">
        <div className="bg-black text-white px-3 py-1 flex justify-between items-center">
          <span className="text-[10px] font-black uppercase">
            Payment Method
          </span>
          <span className="text-[10px] font-black uppercase italic">
            COD / Prepaid
          </span>
        </div>
        <div className="p-3 flex justify-between items-center bg-white">
          <div>
            <p className="text-[10px] font-bold uppercase opacity-70 text-black">
              Total Payable
            </p>
            <p className="text-3xl font-black text-black">
              ৳{Number(order.total_amount).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black uppercase bg-slate-100 px-2 py-1 border border-black text-black">
              {order.payment_method}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Area */}
      <div className="mt-8 pt-4 border-t-2 border-dotted border-black flex justify-between items-center">
        <div className="text-[10px] font-bold italic leading-tight text-black">
          Printed on: {new Date().toLocaleString()} <br />
          System Generated Shipping Sticker
        </div>
        <div className="w-12 h-12 border-2 border-black flex items-center justify-center font-black text-[8px] text-center uppercase p-1 text-black">
          Sofol Bangla
        </div>
      </div>
    </div>
  );
});

ShippingLabel.displayName = "ShippingLabel";

export default ShippingLabel;

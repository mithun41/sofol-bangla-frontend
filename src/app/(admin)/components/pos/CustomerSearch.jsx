import { User, XCircle } from "lucide-react";

export default function CustomerSearch({
  selectedCustomer,
  setSelectedCustomer,
  customerSearch,
  setCustomerSearch,
  customers,
}) {
  return (
    <div className="relative bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm">
      <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-2 ml-2">
        <User size={14} /> Customer Selection
      </label>

      {selectedCustomer ? (
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-2xl border border-blue-100">
          <div className="flex flex-col">
            <span className="font-bold text-blue-700">
              {/* মামা এখানে আমরা নাম বা ইউজারনেম যেটা পাই সেটা দেখাবো */}
              {selectedCustomer.name ||
                selectedCustomer.username ||
                selectedCustomer.first_name ||
                "New Customer"}
            </span>

            {/* যদি ফোন নম্বর থাকে তবে ছোট করে নিচে দেখাবে */}
            {selectedCustomer.phone && (
              <span className="text-[10px] text-blue-500 font-bold">
                {selectedCustomer.phone}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                selectedCustomer.status?.toLowerCase() === "active"
                  ? "bg-green-100 text-green-600"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {/* যদি স্ট্যাটাস না থাকে তবে ডিফল্ট PENDING বা NEW দেখাবে */}
              {(selectedCustomer.status || "NEW").toUpperCase()}
            </span>

            <button
              onClick={() => {
                setSelectedCustomer(null);
                setCustomerSearch("");
              }}
              className="text-rose-500 hover:scale-110 transition"
            >
              <XCircle size={20} />
            </button>
          </div>
        </div>
      ) : (
        <input
          type="text"
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
          placeholder="Type name or phone number..."
          className="w-full bg-transparent px-2 py-1 outline-none font-bold text-slate-700"
        />
      )}

      {/* সার্চ রেজাল্ট ড্রপডাউন */}
      {!selectedCustomer && customers.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white shadow-2xl rounded-2xl border border-slate-100 z-50 overflow-hidden">
          {customers.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                setSelectedCustomer(c);
              }}
              className="p-4 hover:bg-slate-50 cursor-pointer border-b last:border-0"
            >
              <p className="font-bold text-sm">
                {c.username}{" "}
                <span className="text-[10px] opacity-50">({c.status})</span>
              </p>
              <p className="text-[10px] text-slate-400 font-black">{c.phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

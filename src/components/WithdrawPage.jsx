"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";

export default function WithdrawPage() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("BKash");
  const [accountNumber, setAccountNumber] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ১. ইউজারের বর্তমান ব্যালেন্স এবং আগের রিকোয়েস্টগুলো ফেচ করা
  const fetchData = async () => {
    try {
      const res = await api.get("accounts/profile/"); // প্রোফাইল থেকে ব্যালেন্স আনা
      setBalance(res.data.balance);
      const reqRes = await api.get("accounts/withdrawals/"); // উইথড্র লিস্ট আনা
      setRequests(reqRes.data);
    } catch (err) {
      console.error("Error fetching data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ২. উইথড্র রিকোয়েস্ট সাবমিট করা
  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (parseFloat(amount) > balance) {
      alert("Insufficient Balance!");
      return;
    }

    setLoading(true);
    try {
      await api.post("accounts/withdraw-request/", {
        amount: amount,
        method: method,
        account_number: accountNumber,
      });
      setMessage("Request submitted successfully!");
      setAmount("");
      setAccountNumber("");
      fetchData(); // ব্যালেন্স আপডেট করার জন্য
    } catch (err) {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-slate-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Withdraw Funds</h2>

      {/* Balance Card */}
      <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg mb-8">
        <p className="opacity-80">Available Balance</p>
        <h3 className="text-4xl font-black">৳ {balance}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Withdrawal Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Amount (TK)
              </label>
              <input
                type="number"
                required
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Payment Method
              </label>
              <select
                className="w-full p-2 border rounded-lg outline-none"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="BKash">BKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Account Number
              </label>
              <input
                type="text"
                required
                placeholder="017xxxxxxxx"
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:bg-slate-300"
            >
              {loading ? "Processing..." : "Submit Request"}
            </button>
            {message && (
              <p className="text-center text-sm font-medium text-green-600 mt-2">
                {message}
              </p>
            )}
          </form>
        </div>

        {/* Recent Requests Table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <h4 className="font-bold mb-4">Recent Withdrawals</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-2">Date</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-t">
                    <td className="p-2">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-2">৳ {req.amount}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] ${
                          req.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : req.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";

export default function AdminWithdrawalManager() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const res = await api.get("accounts/admin/withdrawals/");
    setRequests(res.data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    if (!confirm(`Are you sure you want to ${action}?`)) return;
    try {
      await api.post(`accounts/admin/withdrawals/${id}/handle/`, { action });
      alert(`Request ${action}ed!`);
      fetchRequests(); // লিস্ট রিফ্রেশ করা
    } catch (err) {
      alert("Error processing request");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">User Withdrawal Requests</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Method (Number)</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-t">
                <td className="p-4 font-medium">{req.user_username}</td>
                <td className="p-4 text-indigo-600 font-bold">৳{req.amount}</td>
                <td className="p-4">
                  {req.method} ({req.account_number})
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
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
                <td className="p-4 space-x-2">
                  {req.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleAction(req.id, "approve")}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(req.id, "reject")}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

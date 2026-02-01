"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";

export default function BonusLogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("accounts/bonus-logs/");
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch logs");
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Bonus Distribution History</h1>
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr className="text-xs font-bold text-slate-500 uppercase">
              <th className="p-4">User</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-semibold text-slate-700">
                  {log.user_username}
                </td>
                <td className="p-4 text-emerald-600 font-bold">
                  ৳ {log.amount}
                </td>
                <td className="p-4 text-sm text-slate-600">{log.reason}</td>
                <td className="p-4 text-xs text-slate-400">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";

export default function BonusLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("accounts/bonus-logs/");
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch bonus logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center text-indigo-600 font-bold">
        Loading Reports...
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            ইনকাম হিস্ট্রি (Bonus Logs)
          </h1>
          <p className="text-slate-500 text-sm">
            আপনার অর্জিত সকল বোনাসের তালিকা এখানে পাবেন।
          </p>
        </div>
        <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-bold text-sm">
          Total Entries: {logs.length}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-5 text-sm font-bold text-slate-600">তারিখ</th>
              <th className="p-5 text-sm font-bold text-slate-600">
                কারণ (Reason)
              </th>
              <th className="p-5 text-sm font-bold text-slate-600 text-right">
                পরিমাণ (Amount)
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="p-5 text-sm text-slate-500">
                    {new Date(log.timestamp).toLocaleDateString()} <br />
                    <span className="text-[10px] opacity-60">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </td>
                  <td className="p-5">
                    <p className="text-sm font-semibold text-slate-700">
                      {log.reason}
                    </p>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">
                      Success
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <span className="text-lg font-bold text-emerald-600">
                      + ৳{log.amount}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-10 text-center text-slate-400">
                  আপনার এখনো কোনো বোনাস জমা হয়নি।
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

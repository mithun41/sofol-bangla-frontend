"use client";
import React, { useEffect, useState } from "react";
import reportService from "@/services/reportService";
import AdminAnalytics from "../components/AdminAnalytics"; // পাথ চেক করে নিস
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // page.jsx এর ভেতরে fetchReport ফাংশন
    const fetchReport = async () => {
      try {
        setLoading(true);
        // টোকেন আর পাস করতে হবে না, ইন্টারসেপ্টর এটা সামলে নিবে
        const data = await reportService.getAdminMonthlyReport();
        setReportData(data);
      } catch (err) {
        console.error("401 Check:", err.response); // যদি এখনো ভুল হয়, এখানে কারণ দেখাবে
        toast.error("Unauthorized or Session Expired");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
        <p className="text-slate-500 font-medium italic">
          Generating monthly report...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          Executive Summary
        </h1>
        <p className="text-slate-500">
          Welcome back, Boss! Here's what's happening this month.
        </p>
      </div>

      {/* যদি ডাটা থাকে তবেই কম্পোনেন্ট দেখাবে */}
      {reportData ? (
        <AdminAnalytics reportData={reportData} />
      ) : (
        <div className="bg-white p-12 rounded-[2rem] text-center border-2 border-dashed border-slate-200">
          <p className="text-slate-400">
            No data available for this month yet.
          </p>
        </div>
      )}
    </div>
  );
}

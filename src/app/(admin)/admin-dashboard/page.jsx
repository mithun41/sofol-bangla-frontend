"use client";
import React, { useEffect, useState } from "react";
import reportService from "@/services/reportService";
import AdminAnalytics from "../components/AdminAnalytics";
import { Loader2, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ডাটা ফেচ করার ফাংশন
  const fetchReport = async () => {
    try {
      setLoading(true);
      // এই কলটি তোর নতুন AdminDashboardStatsView API থেকে ডাটা আনবে
      const data = await reportService.getAdminMonthlyReport();
      setReportData(data);
    } catch (err) {
      console.error("Dashboard Data Fetch Error:", err.response);
      const errorMessage =
        err.response?.data?.detail || "Session Expired. Please login again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="relative">
          <Loader2 className="animate-spin text-emerald-500" size={56} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          </div>
        </div>
        <p className="text-slate-500 font-medium animate-pulse">
          Syncing global funds and member stats...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Executive Summary
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back, Boss! Here's the live status of your MLM ecosystem.
          </p>
        </div>

        {/* কুইক রিফ্রেশ বাটন */}
        <button
          onClick={fetchReport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
        >
          <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          <span className="text-sm font-semibold">Refresh Data</span>
        </button>
      </div>

      {/* মেইন ড্যাশবোর্ড কন্টেন্ট */}
      {reportData ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <AdminAnalytics reportData={reportData} />
        </div>
      ) : (
        <div className="bg-white p-16 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200 shadow-inner">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">
            No Analytics Found
          </h3>
          <p className="text-slate-400 max-w-xs mx-auto">
            We couldn't retrieve any data. Make sure your funds and users are
            properly initialized in the backend.
          </p>
          <button
            onClick={fetchReport}
            className="mt-6 px-6 py-2 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  // মোড সমূহ: login, forgot (Username+Phone), verify (OTP Check), final (New Password)
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    phone: "",
    otp: "",
    new_password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ১. লগইন হ্যান্ডলার
  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await login({
      username: formData.username,
      password: formData.password,
    });

    if (result.success) {
      // লগইন সফল হলে ইউজারের রোল চেক করুন
      const userRole = result.user?.role;

      if (userRole === "posAdmin") {
        toast.success("Welcome to POS System!");
        router.push("/pos/pos"); // posAdmin হলে এখানে যাবে
      } else if (userRole === "admin") {
        toast.success("Welcome Admin!");
        router.push("/admin-dashboard"); // মেইন এডমিন হলে এখানে যাবে
      } else {
        router.push("/"); // অন্য ইউজার বা কাস্টমার হলে
      }
    } else {
      setError(result.error);
      setSubmitting(false);
    }
  };

  // ২. ধাপ ১: ওটিপি রিকোয়েস্ট (Forgot Password)
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await authService.requestOTP({
        username: formData.username,
        phone: formData.phone,
      });
      toast.success(res.message || "OTP sent successfully!");
      setMode("verify"); // ওটিপি পাঠানোর পর ভেরিফাই মোডে যাবে
    } catch (err) {
      const msg = err.message || "User not found";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ৩. ধাপ ২: ওটিপি ভেরিফাই হ্যান্ডলার
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await authService.verifyOTP({
        username: formData.username,
        phone: formData.phone,
        otp: formData.otp,
      });
      toast.success("OTP Verified! Set your new password.");
      setMode("final"); // ওটিপি সঠিক হলে পাসওয়ার্ড রিসেট মোডে যাবে
    } catch (err) {
      const msg = err.message || "Invalid OTP";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ৪. ধাপ ৩: ফাইনাল পাসওয়ার্ড রিসেট
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await authService.resetPassword({
        username: formData.username,
        new_password: formData.new_password,
      });
      toast.success("Password reset successful! Please login.");
      setMode("login");
      setFormData({
        username: "",
        password: "",
        phone: "",
        otp: "",
        new_password: "",
      });
    } catch (err) {
      const msg = err.message || "Reset failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-black mb-6 text-center text-slate-800 uppercase tracking-tight">
          {mode === "login" && "Welcome Back"}
          {mode === "forgot" && "Forgot Identity"}
          {mode === "verify" && "Enter OTP"}
          {mode === "final" && "New Password"}
        </h2>

        {error && (
          <p className="text-red-500 text-xs mb-4 bg-red-50 p-3 rounded-lg text-center font-medium border border-red-100">
            {typeof error === "string" ? error : "Something went wrong"}
          </p>
        )}

        {/* --- LOGIN FORM --- */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setError("");
                }}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white p-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 disabled:bg-blue-400 shadow-lg shadow-blue-500/20"
            >
              {submitting ? "Checking..." : "Sign In"}
            </button>
          </form>
        )}

        {/* --- FORGOT FORM (Step 1) --- */}
        {mode === "forgot" && (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full p-3.5 border border-slate-200 rounded-xl outline-none text-sm"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Phone Number"
              className="w-full p-3.5 border border-slate-200 rounded-xl outline-none text-sm"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-slate-900 text-white p-3.5 rounded-xl font-bold text-xs uppercase tracking-widest disabled:bg-slate-700"
            >
              {submitting ? "Sending..." : "Send OTP"}
            </button>
            <button
              type="button"
              onClick={() => setMode("login")}
              className="w-full text-xs font-bold text-slate-400"
            >
              Back
            </button>
          </form>
        )}

        {/* --- VERIFY OTP FORM (Step 2) --- */}
        {mode === "verify" && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <p className="text-center text-xs text-slate-500">
              OTP sent to {formData.phone}
            </p>
            <input
              type="text"
              placeholder="6-Digit OTP"
              className="w-full p-3.5 border border-slate-200 rounded-xl text-center text-lg font-bold tracking-[8px] outline-none"
              value={formData.otp}
              onChange={(e) =>
                setFormData({ ...formData, otp: e.target.value })
              }
              maxLength={6}
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white p-3.5 rounded-xl font-bold text-xs uppercase"
            >
              {submitting ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {/* --- FINAL RESET FORM (Step 3) --- */}
        {mode === "final" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <input
              type="password"
              placeholder="New Password (min 6 chars)"
              className="w-full p-3.5 border border-slate-200 rounded-xl text-sm outline-none"
              value={formData.new_password}
              onChange={(e) =>
                setFormData({ ...formData, new_password: e.target.value })
              }
              minLength={6}
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 text-white p-3.5 rounded-xl font-bold text-xs uppercase"
            >
              {submitting ? "Resetting..." : "Complete Reset"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

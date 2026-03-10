"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();

  // স্টেটস
  const [mode, setMode] = useState("login"); // login, forgot, reset
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    phone: "",
    otp: "",
    new_password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ১. সাধারণ লগইন হ্যান্ডলার
  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await login({
      username: formData.username,
      password: formData.password,
    });
    if (!result.success) {
      setError(result.error);
      setSubmitting(false);
    }
  };

  // ২. ওটিপি রিকোয়েস্ট হ্যান্ডলার (Username + Phone)
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      // ব্যাকএন্ডে এখন username এবং phone দুইটাই পাঠাতে হবে
      const res = await authService.requestOTP({
        username: formData.username,
        phone: formData.phone,
      });
      toast.success(res.message || "OTP sent to your phone!");
      setMode("reset");
    } catch (err) {
      const msg = err.message || "User not found with these details";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ৩. পাসওয়ার্ড রিসেট হ্যান্ডলার (Username + Phone + OTP + New Password)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await authService.resetPassword({
        username: formData.username, // ব্যাকএন্ডের নতুন লজিক অনুযায়ী এটি প্রয়োজন
        phone: formData.phone,
        otp: formData.otp,
        new_password: formData.new_password,
      });
      toast.success("Password reset successful! Please login.");
      setMode("login");
      setFormData({ ...formData, otp: "", new_password: "" });
    } catch (err) {
      const msg = err.message || "Invalid OTP or request";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-black mb-6 text-center text-slate-800">
          {mode === "login" && "Welcome Back"}
          {mode === "forgot" && "Reset Identity"}
          {mode === "reset" && "Verify OTP"}
        </h2>

        {error && (
          <p className="text-red-500 text-xs mb-4 bg-red-50 p-3 rounded-lg text-center font-medium border border-red-100">
            {error}
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

        {/* --- FORGOT PASSWORD FORM (Username + Phone) --- */}
        {mode === "forgot" && (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <p className="text-xs text-slate-500 text-center mb-2">
              Enter your <b>Username</b> and <b>Phone</b> to receive an OTP.
            </p>
            <input
              type="text"
              placeholder="Your Username"
              className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Phone Number (e.g. 017...)"
              className="w-full p-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
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
              className="text-center w-full text-xs font-bold text-slate-400 mt-2 hover:text-slate-600"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* --- RESET PASSWORD FORM (Username + OTP + New Password) --- */}
        {mode === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center mb-2">
              <p className="text-[10px] uppercase tracking-wider text-blue-600 font-bold">
                Account: {formData.username}
              </p>
              <p className="text-sm font-bold text-slate-700">
                {formData.phone}
              </p>
            </div>
            <input
              type="text"
              placeholder="6-Digit OTP"
              className="w-full p-3.5 border border-slate-200 rounded-xl text-center text-lg font-bold tracking-[10px] outline-none focus:ring-2 focus:ring-blue-500/20"
              value={formData.otp}
              onChange={(e) =>
                setFormData({ ...formData, otp: e.target.value })
              }
              maxLength={6}
              required
            />
            <input
              type="password"
              placeholder="New Password (min 6 chars)"
              className="w-full p-3.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
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
              className="w-full bg-green-600 text-white p-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-green-700 disabled:bg-green-400"
            >
              {submitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

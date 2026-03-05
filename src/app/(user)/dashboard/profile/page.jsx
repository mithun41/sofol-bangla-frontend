"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";
import Swal from "sweetalert2";
import {
  Camera,
  Save,
  User,
  Mail,
  Phone,
  Lock,
  Hash,
  AlertCircle,
} from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // ফিল্ড স্পেসিফিক এরর দেখানোর জন্য

  const fetchProfile = async () => {
    try {
      const res = await api.get("accounts/profile/");
      setUser(res.data);
      setFormData({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        password: "",
      });
    } catch (err) {
      toastError("Failed to load profile data.");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // কমন এরর টোস্ট
  const toastError = (message) => {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: message,
      confirmButtonColor: "#0F172A",
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // ইউজার টাইপ করা শুরু করলে ওই ফিল্ডের এরর মুছে যাবে
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ফাইল সাইজ চেক (ঐচ্ছিক - ২MB এর বেশি হলে আটকাবে)
    if (file.size > 2 * 1024 * 1024) {
      return toastError("File is too large! Please select an image under 2MB.");
    }

    const data = new FormData();
    data.append("profile_picture", file);

    try {
      setLoading(true);
      await api.patch("/accounts/profile/update/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire({
        icon: "success",
        title: "Photo Updated!",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchProfile();
    } catch (err) {
      toastError("Failed to upload photo. Make sure it's an image file.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({}); // আগের সব এরর ক্লিয়ার করা

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    if (formData.password?.trim()) {
      data.append("password", formData.password);
    }

    try {
      await api.patch("/accounts/profile/update/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Profile updated successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      // রিফ্রেশ করার বদলে ডাটা আবার ফেচ করা ভালো, তবে তুই চাইলে reload ও রাখতে পারিস
      fetchProfile();
    } catch (err) {
      if (err.response?.status === 400) {
        const serverErrors = err.response.data;
        setErrors(serverErrors);

        // প্রথম যে এররটা পাবে সেটাকে মেসেজ হিসেবে দেখাবে
        const firstErrorKey = Object.keys(serverErrors)[0];
        const errorMessage = serverErrors[firstErrorKey][0];

        // এখানে generic মেসেজ না দিয়ে সরাসরি ব্যাকএন্ডের এরর দেখাচ্ছি
        toastError(
          `${firstErrorKey.charAt(0).toUpperCase() + firstErrorKey.slice(1)}: ${errorMessage}`,
        );
      } else {
        toastError("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900"></div>
        <p className="text-slate-500 font-bold animate-pulse">
          Loading Profile...
        </p>
      </div>
    );

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-slate-900 px-8 py-10 text-center relative">
          {/* Active/Inactive Status Badge */}
          <div className="absolute top-6 right-6">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm ${
                user.is_active || user.status === "active"
                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/50 text-rose-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  user.is_active || user.status === "active"
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-rose-500"
                }`}
              ></span>
              <span className="text-[10px] font-black uppercase tracking-widest">
                {user.is_active || user.status === "active"
                  ? "Active Account"
                  : "Inactive"}
              </span>
            </div>
          </div>

          {/* Profile Picture & Other Info */}
          <div className="relative inline-block group">
            <img
              src={user.profile_picture || "/default-avatar.png"}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl mx-auto"
              alt="Profile"
            />
            <label className="absolute bottom-0 right-0 bg-blue-600 p-2.5 rounded-full cursor-pointer hover:scale-110 transition shadow-lg border-2 border-white">
              <Camera size={18} className="text-white" />
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={loading}
                accept="image/*"
              />
            </label>
          </div>
          <h2 className="text-2xl font-black text-white mt-4">
            {user.name || user.username}
          </h2>
          <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            {user.role || "Member"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 px-1">
                <User size={14} /> Full Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition font-semibold ${errors.name ? "border-red-400 bg-red-50" : "border-slate-100 focus:border-slate-900"}`}
                placeholder="Full Name"
              />
              {errors.name && (
                <p className="text-red-500 text-[10px] font-bold mt-1 px-1 flex items-center gap-1">
                  <AlertCircle size={10} /> {errors.name[0]}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 px-1">
                <Mail size={14} /> Email Address
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition font-semibold ${errors.email ? "border-red-400 bg-red-50" : "border-slate-100 focus:border-slate-900"}`}
              />
              {errors.email && (
                <p className="text-red-500 text-[10px] font-bold mt-1 px-1 flex items-center gap-1">
                  <AlertCircle size={10} /> {errors.email[0]}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-2 px-1">
                <Phone size={14} /> Phone Number
              </label>
              <p className="font-mono font-bold text-slate-700 pl-5 ">
                {user.phone}
              </p>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-xs font-black text-blue-600 uppercase flex items-center gap-2 px-1">
                <Lock size={14} /> Password (Leave blank to keep same)
              </label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition font-semibold border-blue-50 border-dashed focus:border-blue-600`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-[10px] font-bold mt-1 px-1 flex items-center gap-1">
                  <AlertCircle size={10} /> {errors.password[0]}
                </p>
              )}
            </div>
          </div>

          {/* IDs - Read Only */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                <Hash size={10} /> Referral ID
              </p>
              <p className="font-mono font-bold text-slate-700">
                {user.reff_id}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                <Hash size={10} /> Placement ID
              </p>
              <p className="font-mono font-bold text-slate-700">
                {user.placement_id}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition shadow-xl flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Updating...
              </div>
            ) : (
              <>
                <Save size={18} /> Save Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

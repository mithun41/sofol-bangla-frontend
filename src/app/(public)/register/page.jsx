"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2"; // ✅ SweetAlert2 ইম্পোর্ট

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    division: "",
    reff_id: "",
    placement_id: "",
    position: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const divisions = [
    "Dhaka",
    "Chittagong",
    "Rajshahi",
    "Khulna",
    "Barisal",
    "Sylhet",
    "Rangpur",
    "Mymensingh",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await authService.register(formData);

      await Swal.fire({
        title: "Success!",
        text: "Account created. Logging you in...",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      const result = await login({
        username: formData.username,
        password: formData.password,
      });

      if (result.success) {
      } else {
        router.push("/login");
      }
    } catch (err) {
      if (err && typeof err === "object") {
        setErrors(err);
      } else {
        setErrors({ general: "Registration failed." });
      }
    } finally {
      setLoading(false);
    }
  };
  console.log(errors.username?.[0]);
  console.log(errors.phone?.[0]);
  console.log(errors.password?.[0]);
  console.log(errors.placement_id?.[0]);
  console.log(errors.reff_id?.[0]);
  const renderError = (field) => {
    if (!errors[field]) return null;
    const message = Array.isArray(errors[field])
      ? errors[field][0]
      : errors[field];
    return (
      <p className="text-red-500 text-[11px] mt-1 ml-1 font-medium italic">
        {message}
      </p>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium italic">
            Join Sofol Bangla Network
          </p>
        </div>

        {errors.non_field_errors || errors.general ? (
          <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-center text-xs font-bold">
            {errors.non_field_errors?.[0] || errors.general}
          </div>
        ) : null}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className={`appearance-none rounded-xl block w-full px-4 py-3 border ${errors.username ? "border-red-500 bg-red-50" : "border-slate-200"} placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm`}
              placeholder="Username"
            />
            {renderError("username")}
          </div>

          {/* Email (Optional - removed 'required') */}
          <div>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`appearance-none rounded-xl block w-full px-4 py-3 border ${errors.email ? "border-red-500 bg-red-50" : "border-slate-200"} placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm`}
              placeholder="Email address (Optional)"
            />
            {renderError("email")}
          </div>

          {/* Phone & Division */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                className={`appearance-none rounded-xl block w-full px-4 py-3 border ${errors.phone ? "border-red-500 bg-red-50" : "border-slate-200"} placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm`}
                placeholder="Phone"
              />
              {renderError("phone")}
            </div>
            <div>
              <select
                name="division"
                value={formData.division}
                onChange={handleChange}
                className={`block w-full px-4 py-3 border ${errors.division ? "border-red-500 bg-red-50" : "border-slate-200"} rounded-xl text-sm text-slate-500 font-medium`}
              >
                <option value="">Division</option>
                {divisions.map((div) => (
                  <option key={div} value={div}>
                    {div}
                  </option>
                ))}
              </select>
              {renderError("division")}
            </div>
          </div>

          {/* Password */}
          <div>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`appearance-none rounded-xl block w-full px-4 py-3 border ${errors.password ? "border-red-500 bg-red-50" : "border-slate-200"} placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm`}
              placeholder="Password"
            />
            {renderError("password")}
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-slate-400 bg-white px-2 italic">
              Network Details
            </div>
          </div>

          {/* Referral & Placement */}
          <div className="space-y-3">
            <input
              name="reff_id"
              type="text"
              value={formData.reff_id}
              onChange={handleChange}
              className="appearance-none rounded-xl block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all"
              placeholder="Referral ID (Optional)"
            />
            {renderError("reff_id")}

            <div className="grid grid-cols-2 gap-3">
              <input
                name="placement_id"
                type="text"
                value={formData.placement_id}
                onChange={handleChange}
                className={`appearance-none rounded-xl block w-full px-4 py-3 border ${errors.placement_id ? "border-red-500 bg-red-50" : "border-slate-200"} placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all`}
                placeholder="Placement ID"
              />
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={`block w-full px-4 py-3 border ${errors.position ? "border-red-500 bg-red-50" : "border-slate-200"} rounded-xl text-sm text-slate-500 transition-all`}
              >
                <option value="">Position</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
            {renderError("placement_id")}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-black uppercase tracking-widest rounded-xl text-white transition-all shadow-blue-500/20 shadow-lg ${
              loading
                ? "bg-blue-400 cursor-not-allowed scale-95"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
          >
            {loading ? "Processing..." : "Register Now"}
          </button>
        </form>
      </div>
    </div>
  );
}

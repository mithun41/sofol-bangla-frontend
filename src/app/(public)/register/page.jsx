"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
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

      if (!result.success) router.push("/login");
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

  const renderError = (field) => {
    if (!errors[field]) return null;
    const message = Array.isArray(errors[field])
      ? errors[field][0]
      : errors[field];

    return (
      <p className="text-red-500 text-xs mt-1 ml-1 font-medium italic">
        {message}
      </p>
    );
  };

  const inputStyle =
    "appearance-none rounded-xl block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF620A]/30 focus:border-[#FF620A] transition text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-slate-100 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-black text-slate-900">Create Account</h2>

          <p className="mt-2 text-sm text-slate-500">
            Join{" "}
            <span className="text-[#007A55] font-semibold">Sofol Bangla</span>{" "}
            Network
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={`${inputStyle} ${errors.name ? "border-red-500 bg-red-50" : ""}`}
              placeholder="Full Name"
            />
            {renderError("name")}
          </div>

          {/* Username */}
          <div>
            <input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className={`${inputStyle} ${errors.username ? "border-red-500 bg-red-50" : ""}`}
              placeholder="Username"
            />
            {renderError("username")}
          </div>

          {/* Email */}
          <div>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`${inputStyle} ${errors.email ? "border-red-500 bg-red-50" : ""}`}
              placeholder="Email address (Optional)"
            />
            {renderError("email")}
          </div>

          {/* Phone + Division */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                className={`${inputStyle} ${errors.phone ? "border-red-500 bg-red-50" : ""}`}
                placeholder="Phone"
              />
              {renderError("phone")}
            </div>

            <div>
              <select
                name="division"
                value={formData.division}
                onChange={handleChange}
                className={`${inputStyle} text-slate-600`}
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
              className={`${inputStyle} ${errors.password ? "border-red-500 bg-red-50" : ""}`}
              placeholder="Password"
            />
            {renderError("password")}
          </div>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200"></span>
            </div>

            <div className="relative flex justify-center text-[11px] uppercase font-bold text-slate-400 bg-white px-3">
              Network Details
            </div>
          </div>

          {/* Referral */}
          <div>
            <input
              name="reff_id"
              type="text"
              value={formData.reff_id}
              onChange={handleChange}
              className={inputStyle}
              placeholder="Referral ID (Optional)"
            />
            {renderError("reff_id")}
          </div>

          {/* Placement */}
          <div className="grid grid-cols-2 gap-3">
            <input
              name="placement_id"
              type="text"
              value={formData.placement_id}
              onChange={handleChange}
              className={`${inputStyle} ${errors.placement_id ? "border-red-500 bg-red-50" : ""}`}
              placeholder="Placement ID"
            />

            <select
              name="position"
              value={formData.position}
              onChange={handleChange}
              className={`${inputStyle} text-slate-600`}
            >
              <option value="">Position</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>

          {renderError("placement_id")}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide transition-all ${
              loading
                ? "bg-orange-300 cursor-not-allowed"
                : "bg-[#FF620A] hover:bg-[#e45700]"
            }`}
          >
            {loading ? "Processing..." : "Register Now"}
          </button>
        </form>
      </div>
    </div>
  );
}

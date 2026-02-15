"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";

export default function RegisterPage() {
  const router = useRouter();
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
    // ইউজার টাইপ করা শুরু করলে ওই ফিল্ডের এরর মুছে যাবে
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
      alert("Account created successfully!");
      router.push("/login");
    } catch (err) {
      console.log("Error caught in Page:", err);
      // ব্যাকএন্ড থেকে আসা এরর অবজেক্ট (যেমন: {email: ["already exists"]}) সেট করা
      if (err && typeof err === "object") {
        setErrors(err);
      } else {
        setErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // স্পেসিফিক ফিল্ড এরর দেখানোর হেল্পার
  const renderError = (field) => {
    if (!errors[field]) return null;
    // ডিজেঙ্গো অনেক সময় লিস্ট পাঠায়, তাই প্রথম এলিমেন্টটি দেখানো
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Sofol Bangla Network
          </p>
        </div>

        {errors.non_field_errors || errors.general ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-center text-sm">
            {errors.non_field_errors?.[0] || errors.general}
          </div>
        ) : null}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <input
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className={`appearance-none rounded-lg block w-full px-4 py-2.5 border ${errors.username ? "border-red-500 bg-red-50" : "border-gray-300"} placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm`}
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
              className={`appearance-none rounded-lg block w-full px-4 py-2.5 border ${errors.email ? "border-red-500 bg-red-50" : "border-gray-300"} placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm`}
              placeholder="Email address"
            />
            {renderError("email")}
          </div>

          {/* Phone & Division */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                className={`appearance-none rounded-lg block w-full px-4 py-2.5 border ${errors.phone ? "border-red-500 bg-red-50" : "border-gray-300"} placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm`}
                placeholder="Phone"
              />
              {renderError("phone")}
            </div>
            <div>
              <select
                name="division"
                value={formData.division}
                onChange={handleChange}
                className={`block w-full px-4 py-2.5 border ${errors.division ? "border-red-500 bg-red-50" : "border-gray-300"} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm text-gray-600`}
              >
                <option value="">Select Division</option>
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
              className={`appearance-none rounded-lg block w-full px-4 py-2.5 border ${errors.password ? "border-red-500 bg-red-50" : "border-gray-300"} placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm`}
              placeholder="Password"
            />
            {renderError("password")}
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400 font-bold italic">
                Network Details
              </span>
            </div>
          </div>

          {/* Referral ID */}
          <div>
            <input
              name="reff_id"
              type="text"
              value={formData.reff_id}
              onChange={handleChange}
              className={`appearance-none rounded-lg block w-full px-4 py-2.5 border ${errors.reff_id ? "border-red-500 bg-red-50" : "border-gray-300"} placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm`}
              placeholder="Referral ID (Optional)"
            />
            {renderError("reff_id")}
          </div>

          {/* Placement ID & Position */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                name="placement_id"
                type="text"
                value={formData.placement_id}
                onChange={handleChange}
                className={`appearance-none rounded-lg block w-full px-4 py-2.5 border ${errors.placement_id ? "border-red-500 bg-red-50" : "border-gray-300"} placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm`}
                placeholder="Placement ID"
              />
              {renderError("placement_id")}
            </div>
            <div>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={`block w-full px-4 py-2.5 border ${errors.position ? "border-red-500 bg-red-50" : "border-gray-300"} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all sm:text-sm text-gray-600`}
              >
                <option value="">Position (Auto)</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
              {renderError("position")}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white transition-all shadow-md ${
              loading
                ? "bg-blue-400 cursor-not-allowed scale-95"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95 hover:shadow-lg"
            }`}
          >
            {loading ? "Creating Account..." : "Register Now"}
          </button>
        </form>
      </div>
    </div>
  );
}

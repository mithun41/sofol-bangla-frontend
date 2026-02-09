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
    division: "", // নতুন ফিল্ড
    reff_id: "",
    placement_id: "",
    position: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // বাংলাদেশের বিভাগগুলোর লিস্ট
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
      setErrors((prev) => ({ ...prev, [name]: null }));
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
      setErrors(
        typeof err === "object" ? err : { general: "Something went wrong" },
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Sofol Bangla Network
          </p>
        </div>

        {errors.general && (
          <div className="bg-red-100 text-red-700 p-2 rounded text-center text-sm">
            {errors.general}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {/* Username & Email */}
          <div className="space-y-4">
            <input
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className={`appearance-none rounded-md block w-full px-3 py-2 border ${errors.username ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 sm:text-sm`}
              placeholder="Username"
            />
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`appearance-none rounded-md block w-full px-3 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 sm:text-sm`}
              placeholder="Email address"
            />
          </div>

          {/* Phone & Division */}
          <div className="grid grid-cols-2 gap-4">
            <input
              name="phone"
              type="text"
              required
              value={formData.phone}
              onChange={handleChange}
              className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 sm:text-sm"
              placeholder="Phone"
            />
            <select
              name="division"
              required
              value={formData.division}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 sm:text-sm text-gray-600"
            >
              <option value="">Select Division</option>
              {divisions.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <input
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 sm:text-sm"
            placeholder="Password"
          />

          <hr className="my-4" />
          <p className="text-xs text-gray-500 font-semibold">
            Networking Info (Optional for Auto-Placement)
          </p>

          {/* Referral ID */}
          <input
            name="reff_id"
            type="text"
            value={formData.reff_id}
            onChange={handleChange}
            placeholder="Referral ID (Optional)"
          />

          {/* Placement ID & Position */}
          <div className="grid grid-cols-2 gap-4">
            <input
              name="placement_id"
              type="text"
              value={formData.placement_id}
              onChange={handleChange}
              className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 sm:text-sm"
              placeholder="Placement ID (Optional)"
            />
            <select
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 sm:text-sm text-gray-600"
            >
              <option value="">Position (Auto)</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-all ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-95"
            }`}
          >
            {loading ? "Processing..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

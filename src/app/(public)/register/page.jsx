"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService"; // authService ইম্পোর্ট করুন

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    reff_code_input: "",
    placement_id_input: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // ইউজার টাইপ করা শুরু করলে ওই ফিল্ডের এরর মুছে ফেলা
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // আপনার authService থেকে register ফাংশনটি কল করা হচ্ছে
      await authService.register(formData);
      alert("Account created successfully!");
      router.push("/login");
    } catch (err) {
      // জ্যাঙ্গো থেকে আসা ভ্যালিডেশন এররগুলো সেট করা
      // যদি নেটওয়ার্ক এরর হয় তবে 'Error' মেসেজ দেখাবে
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

        {/* যদি কোনো জেনারেল এরর থাকে */}
        {errors.general && (
          <div className="bg-red-100 text-red-700 p-2 rounded text-center text-sm">
            {errors.general}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <input
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.username ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="Username"
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username[0]}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="Email address"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <input
              name="phone"
              type="text"
              required
              value={formData.phone}
              onChange={handleChange}
              className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.phone ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="Phone Number"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone[0]}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${errors.password ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="Password"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>
            )}
          </div>

          {/* Referral & Placement */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                name="reff_code_input"
                type="text"
                value={formData.reff_code_input}
                onChange={handleChange}
                className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:ring-blue-500 sm:text-sm"
                placeholder="Referral ID"
              />
            </div>
            <div>
              <input
                name="placement_id_input"
                type="text"
                value={formData.placement_id_input}
                onChange={handleChange}
                className={`appearance-none rounded-md block w-full px-3 py-2 border ${errors.placement_id_input ? "border-red-500" : "border-gray-300"} placeholder-gray-400 text-gray-900 focus:ring-blue-500 sm:text-sm`}
                placeholder="Placement ID"
              />
            </div>
          </div>

          {/* নিচের এররগুলো বিশেষ করে বাইনারি লিমিট এরর হ্যান্ডেল করবে */}
          {errors.placement_id_input && (
            <p className="text-red-500 text-center text-xs">
              {errors.placement_id_input[0]}
            </p>
          )}
          {errors.non_field_errors && (
            <p className="text-red-500 text-center text-xs">
              {errors.non_field_errors[0]}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-all ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              } focus:outline-none`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

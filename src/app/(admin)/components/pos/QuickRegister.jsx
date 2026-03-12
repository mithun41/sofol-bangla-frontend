"use client";

import { useState } from "react";
import {
  UserPlus,
  MapPin,
  Phone,
  Lock,
  User,
  Link as LinkIcon,
  Layers,
} from "lucide-react";
import { authService } from "@/services/authService";
import { toast } from "react-hot-toast";

export default function QuickRegister({ onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
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
      const res = await authService.register(formData);
      console.log("API Response in QuickRegister:", res);
      const userData = res?.data || res;
      toast.success("Customer registered successfully!"); // Updated
      onRegisterSuccess(userData);

      setFormData({
        name: "",
        username: "",
        password: "",
        phone: "",
        division: "",
        reff_id: "",
        placement_id: "",
        position: "",
      });
    } catch (err) {
      if (err && typeof err === "object") {
        setErrors(err);
        toast.error("Validation failed. Please check fields."); // Updated
      } else {
        toast.error("Registration failed!"); // Updated
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
      <p className="text-red-500 text-[10px] mt-1 font-medium italic">
        {message}
      </p>
    );
  };

  const inputStyle = (field) =>
    `w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-xl border ${
      errors[field] ? "border-red-500 bg-red-50" : "border-slate-200"
    } text-sm font-bold outline-[#FF620A] transition-all`;

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm mt-4">
      <h3 className="flex items-center gap-2 text-[10px] font-black uppercase text-[#FF620A] mb-4 ml-2 tracking-widest">
        <UserPlus size={14} /> Quick Customer Register
      </h3>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-3"
      >
        <div className="relative">
          <User className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            name="name"
            type="text"
            placeholder="Full Name *"
            className={inputStyle("name")}
            value={formData.name}
            onChange={handleChange}
            required
          />
          {renderError("name")}
        </div>

        <div className="relative">
          <User className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            name="username"
            type="text"
            placeholder="Username *"
            className={inputStyle("username")}
            value={formData.username}
            onChange={handleChange}
            required
          />
          {renderError("username")}
        </div>

        <div className="relative">
          <Phone className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            name="phone"
            type="number"
            placeholder="Phone *"
            className={inputStyle("phone")}
            value={formData.phone}
            onChange={handleChange}
            required
          />
          {renderError("phone")}
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            name="password"
            type="password"
            placeholder="Password *"
            className={inputStyle("password")}
            value={formData.password}
            onChange={handleChange}
            required
          />
          {renderError("password")}
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
          <select
            name="division"
            className={inputStyle("division")}
            value={formData.division}
            onChange={handleChange}
            required
          >
            <option value="">Division *</option>
            {divisions.map((div) => (
              <option key={div} value={div}>
                {div}
              </option>
            ))}
          </select>
          {renderError("division")}
        </div>

        <div className="relative">
          <LinkIcon
            className="absolute left-3 top-3 text-slate-400"
            size={16}
          />
          <input
            name="reff_id"
            type="text"
            placeholder="Referral ID (Opt)"
            className={inputStyle("reff_id")}
            value={formData.reff_id}
            onChange={handleChange}
          />
          {renderError("reff_id")}
        </div>

        <div className="relative">
          <Layers className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            name="placement_id"
            type="text"
            placeholder="Placement ID (Opt)"
            className={inputStyle("placement_id")}
            value={formData.placement_id}
            onChange={handleChange}
          />
          {renderError("placement_id")}
        </div>

        <div className="relative">
          <Layers className="absolute left-3 top-3 text-slate-400" size={16} />
          <select
            name="position"
            className={inputStyle("position")}
            value={formData.position}
            onChange={handleChange}
          >
            <option value="">Position (Opt)</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
          {renderError("position")}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-4 bg-[#FF620A] hover:bg-slate-900 text-white font-black py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 mt-2 shadow-md"
        >
          {loading ? "Registering..." : "Register & Select Customer"}
        </button>
      </form>
    </div>
  );
}

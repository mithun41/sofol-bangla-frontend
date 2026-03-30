"use client";

import { useState, memo } from "react"; // memo যোগ করা হয়েছে
import {
  UserPlus,
  MapPin,
  Phone,
  Lock,
  User,
  Link as LinkIcon,
  Layers,
  AlertCircle,
} from "lucide-react";
import { authService } from "@/services/authService";
import { toast } from "react-hot-toast";

// ১. Field কম্পোনেন্টকে বাইরে নিয়ে আসা হয়েছে যাতে রি-রেন্ডারে ফোকাস না হারায়
const Field = ({ name, placeholder, icon: Icon, type = "text", required = false, value, onChange, error, children }) => (
  <div>
    <div
      className={`flex items-center gap-2 bg-white border rounded-xl px-3 py-2.5 transition-all
        ${error
          ? "border-rose-300 bg-rose-50"
          : "border-slate-200 focus-within:border-blue-300 focus-within:bg-white"
        }`}
    >
      <Icon size={13} className="text-slate-400 shrink-0" />
      {children || (
        <input
          name={name}
          type={type}
          placeholder={placeholder + (required ? " *" : "")}
          className="flex-1 bg-transparent outline-none text-xs font-semibold text-slate-700 placeholder:text-slate-300"
          value={value}
          onChange={onChange}
          required={required}
          autoComplete="off"
        />
      )}
    </div>
    {error && (
      <p className="flex items-center gap-1 text-rose-500 text-[10px] mt-1 font-semibold">
        <AlertCircle size={9} /> {Array.isArray(error) ? error[0] : error}
      </p>
    )}
  </div>
);

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

  const divisions = ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur", "Mymensingh"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    // ফোকাস ধরে রাখতে স্টেট আপডেট লজিক সহজ করা হয়েছে
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // শুধু যদি ওই ফিল্ডে এরর থাকে তবেই এরর স্টেট আপডেট হবে
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await authService.register(formData);
      const userData = res?.data || res;
      toast.success("Customer registered successfully!");
      onRegisterSuccess(userData);
      setFormData({
        name: "", username: "", password: "", phone: "",
        division: "", reff_id: "", placement_id: "", position: "",
      });
    } catch (err) {
      if (err && typeof err === "object") {
        setErrors(err);
        toast.error("Validation failed.");
      } else {
        toast.error("Registration failed!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
          <UserPlus size={14} />
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-600">
          Quick Register
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Field name="name" placeholder="Full Name" icon={User} required value={formData.name} onChange={handleChange} error={errors.name} />
        <Field name="username" placeholder="Username" icon={User} required value={formData.username} onChange={handleChange} error={errors.username} />
        <Field name="phone" placeholder="Phone" icon={Phone} type="number" required value={formData.phone} onChange={handleChange} error={errors.phone} />
        <Field name="password" placeholder="Password" icon={Lock} type="password" required value={formData.password} onChange={handleChange} error={errors.password} />

        <Field name="division" placeholder="Division" icon={MapPin} required error={errors.division}>
          <select
            name="division"
            value={formData.division}
            onChange={handleChange}
            required
            className="flex-1 bg-transparent outline-none text-xs font-semibold text-slate-700 appearance-none cursor-pointer"
          >
            <option value="">Division *</option>
            {divisions.map((div) => <option key={div} value={div}>{div}</option>)}
          </select>
        </Field>

        <Field name="reff_id" placeholder="Referral ID" icon={LinkIcon} value={formData.reff_id} onChange={handleChange} error={errors.reff_id} />
        <Field name="placement_id" placeholder="Placement ID" icon={Layers} value={formData.placement_id} onChange={handleChange} error={errors.placement_id} />

        <Field name="position" placeholder="Position" icon={Layers} error={errors.position}>
          <select
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="flex-1 bg-transparent outline-none text-xs font-semibold text-slate-700 appearance-none cursor-pointer"
          >
            <option value="">Position (Optional)</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-4 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all active:scale-[0.99] mt-1"
        >
          {loading ? "Registering..." : "Register & Select Customer"}
        </button>
      </form>
    </div>
  );
}
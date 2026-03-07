import { useState } from "react";
import {
  UserPlus,
  MapPin,
  Phone,
  Lock,
  User,
  Mail,
  Link,
  Layers,
} from "lucide-react";
import { authService } from "@/services/authService";
import { toast } from "react-hot-toast";

export default function QuickRegister({ onRegisterSuccess }) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.register(formData);
      toast.success("কাস্টমার মেম্বার হিসেবে যুক্ত হয়েছে!");

      // রেজিস্ট্রেশনের পর ইউজারের ডাটা অটো-সিলেক্ট করার জন্য পাঠানো
      onRegisterSuccess(response.userinfo || response.user || response);

      // ফর্ম রিসেট
      setFormData({
        username: "",
        password: "",
        email: "",
        phone: "",
        division: "",
        reff_id: "",
        placement_id: "",
        position: "",
      });
    } catch (err) {
      toast.error(err.username?.[0] || err.message || "রেজিস্ট্রেশন ব্যর্থ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm mt-4">
      <h3 className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 mb-4 ml-2 tracking-widest">
        <UserPlus size={14} /> Quick Customer Register
      </h3>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-3"
      >
        {/* Username */}
        <div className="relative">
          <User className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Username"
            required
            className="w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-xl border-none text-sm font-bold outline-blue-500"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            type="email"
            placeholder="Email (Optional)"
            className="w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-xl border-none text-sm font-bold outline-blue-500"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>

        {/* Phone */}
        <div className="relative">
          <Phone className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Phone"
            required
            className="w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-xl border-none text-sm font-bold outline-blue-500"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>

        {/* Division Dropdown */}
        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
          <select
            required
            className="w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-xl border-none text-sm font-bold outline-blue-500 appearance-none text-slate-600"
            value={formData.division}
            onChange={(e) =>
              setFormData({ ...formData, division: e.target.value })
            }
          >
            <option value="">Division</option>
            {divisions.map((div) => (
              <option key={div} value={div}>
                {div}
              </option>
            ))}
          </select>
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-xl border-none text-sm font-bold outline-blue-500"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
        </div>

        {/* Referral ID */}
        <div className="relative">
          <Link className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Referral ID"
            className="w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-xl border-none text-sm font-bold outline-blue-500"
            value={formData.reff_id}
            onChange={(e) =>
              setFormData({ ...formData, reff_id: e.target.value })
            }
          />
        </div>

        {/* Placement ID */}
        <div className="relative">
          <Layers className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Placement ID"
            className="w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-xl border-none text-sm font-bold outline-blue-500"
            value={formData.placement_id}
            onChange={(e) =>
              setFormData({ ...formData, placement_id: e.target.value })
            }
          />
        </div>

        {/* Position Dropdown */}
        <div className="relative">
          <Layers className="absolute left-3 top-3 text-slate-400" size={16} />
          <select
            className="w-full bg-slate-50 pl-10 pr-4 py-2.5 rounded-xl border-none text-sm font-bold outline-blue-500 appearance-none text-slate-600"
            value={formData.position}
            onChange={(e) =>
              setFormData({ ...formData, position: e.target.value })
            }
          >
            <option value="">Position</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-4 bg-slate-900 text-white font-black py-3 rounded-xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 mt-2"
        >
          {loading ? "Creating Account..." : "Register & Apply Membership"}
        </button>
      </form>
    </div>
  );
}

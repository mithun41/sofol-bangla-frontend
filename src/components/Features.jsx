import { Truck, ShieldCheck, Zap, Headphones } from "lucide-react";

const featureData = [
  {
    icon: <Truck size={24} />,
    title: "Fast Delivery",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Authentic Products",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: <Zap size={24} />,
    title: "Matching Bonus",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: <Headphones size={24} />,
    title: "Support 24/7",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

export default function Features() {
  return (
    <section className="py-12 max-w-[1400px] mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {featureData.map((item, idx) => (
          <div
            key={idx}
            className="group flex flex-col items-center justify-center p-6 rounded-xl border border-slate-100 bg-white hover:border-[#FF620A]/40 transition-all duration-300 shadow-sm"
          >
            {/* Icon Box - NewArrivals এর ইমেজ বক্সের মতো স্টাইল */}
            <div
              className={`w-14 h-14 ${item.bg} ${item.color} rounded-full flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110`}
            >
              {item.icon}
            </div>

            {/* Title */}
            <h3 className="font-bold text-slate-800 text-[14px] md:text-[16px] tracking-tight group-hover:text-[#FF620A] transition-colors">
              {item.title}
            </h3>

            {/* ছোট একটা ডেকোরেশন লাইন যেটা হোভারে আসবে */}
            <div className="w-0 h-0.5 bg-[#FF620A] mt-2 group-hover:w-8 transition-all duration-300 rounded-full"></div>
          </div>
        ))}
      </div>
    </section>
  );
}

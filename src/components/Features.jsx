import { Truck, ShieldCheck, Zap, Users } from "lucide-react";

const featureData = [
  {
    icon: <Truck />,
    title: "Fast Delivery",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: <ShieldCheck />,
    title: "Authentic Products",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: <Zap />,
    title: "Matching Bonus",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: <Users />,
    title: "Support 24/7",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

export default function Features() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
      {featureData.map((item, idx) => (
        <div key={idx} className="group text-center">
          <div
            className={`w-16 h-16 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:-translate-y-2 transition-transform duration-300`}
          >
            {item.icon}
          </div>
          <h3 className="font-black text-slate-800">{item.title}</h3>
        </div>
      ))}
    </section>
  );
}

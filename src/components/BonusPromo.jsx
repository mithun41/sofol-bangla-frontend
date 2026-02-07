import { Star } from "lucide-react";

export default function BonusPromo() {
  const levels = [
    { star: "4 Star", cash: "5,000" },
    { star: "6 Star", cash: "30,000" },
    { star: "8 Star", cash: "1,00,000" },
  ];

  return (
    <section className="px-6 mb-20">
      <div className="max-w-7xl mx-auto bg-blue-600 rounded-[3rem] p-8 md:p-16 text-white flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
        <Star className="absolute -bottom-10 -left-10 text-white/5 w-64 h-64" />
        <div className="relative z-10 max-w-xl text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            Achieve Ranks & <br /> Get Paid Big!
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {levels.map((l, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10"
              >
                <p className="text-[10px] font-bold text-blue-200 uppercase">
                  {l.star}
                </p>
                <p className="text-xl font-black italic">৳{l.cash}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-amber-400 text-slate-900 w-32 h-32 md:w-44 md:h-44 rounded-full flex flex-col items-center justify-center rotate-12 shadow-2xl">
          <span className="text-xs font-black uppercase tracking-widest">
            Bonus
          </span>
          <span className="text-3xl md:text-5xl font-black">WIN</span>
        </div>
      </div>
    </section>
  );
}

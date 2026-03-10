import { Star, Trophy } from "lucide-react";

export default function BonusPromo() {
  const levels = [
    { star: "4 Star", cash: "5,000" },
    { star: "6 Star", cash: "30,000" },
    { star: "8 Star", cash: "1,00,000" },
  ];

  return (
    <section className="px-4 md:px-6 mb-20">
      <div className="max-w-7xl mx-auto rounded-[40px] bg-gradient-to-r from-[#FF620A] to-[#ff7e35] p-8 md:p-14 text-white relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Title */}
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="text-yellow-300" size={22} />
            <span className="uppercase font-bold text-sm tracking-wider">
              Rank Bonus
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black mb-10 leading-tight">
            Achieve Star Levels <br className="hidden md:block" />
            Earn Massive Rewards
          </h2>

          {/* Bonus Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-xl">
            {levels.map((lvl, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center"
              >
                <Star className="mx-auto mb-2 text-yellow-300" size={20} />

                <p className="text-xs font-bold uppercase tracking-wider text-white/80">
                  {lvl.star}
                </p>

                <p className="text-xl md:text-2xl font-black mt-1">
                  ৳{lvl.cash}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

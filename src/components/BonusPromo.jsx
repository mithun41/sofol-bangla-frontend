import { Trophy, TrendingUp, Star } from "lucide-react";
import Link from "next/link";

export default function BonusPromo() {
  const levels = [
    { star: "4 Star", reward: "৳5,000" },
    { star: "6 Star", reward: "৳30,000" },
    { star: "8 Star", reward: "৳1,00,000" },
  ];

  return (
    <section className="px-6 mb-24">
      <div className="max-w-7xl mx-auto rounded-[40px] bg-gradient-to-r from-[#FF620A] to-[#ff7e35] p-10 md:p-16 text-white relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
          {/* LEFT CONTENT */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="text-yellow-300" size={22} />
              <span className="uppercase font-bold text-sm tracking-wider">
                Rank Rewards
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              Level Up Your <br /> Income Potential
            </h2>

            <p className="text-white/90 max-w-md mb-8 text-sm md:text-base">
              Grow your network, unlock new star levels, and earn powerful
              performance bonuses. The higher you rise, the bigger the rewards.
            </p>

            <Link
              href="/plan"
              className="inline-flex items-center gap-2 bg-white text-[#FF620A] px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition"
            >
              View Business Plan
              <TrendingUp size={16} />
            </Link>
          </div>

          {/* RIGHT REWARD CARDS */}
          <div className="grid grid-cols-3 gap-4">
            {levels.map((lvl, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 text-center hover:bg-white/20 transition"
              >
                <Star className="mx-auto mb-2 text-yellow-300" size={20} />
                <p className="text-xs font-bold uppercase tracking-wider text-white/80">
                  {lvl.star}
                </p>
                <p className="text-xl md:text-2xl font-black mt-1">
                  {lvl.reward}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

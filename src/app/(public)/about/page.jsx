"use client";

import React from "react";
import { ShoppingBag, Users, ShieldCheck, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-sm font-bold tracking-widest text-[#FF620A] uppercase">
            About Us
          </h2>

          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-slate-900">
            Empowering Entrepreneurs Through Quality Products
          </h1>

          <p className="mt-4 text-slate-500 text-base md:text-lg leading-relaxed">
            At{" "}
            <span className="font-semibold text-[#FF620A]">Sofol Bangla</span>,
            we believe everyone deserves the opportunity to become an
            entrepreneur. We provide high-quality products and a powerful
            earning ecosystem to help individuals build a sustainable future.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<ShoppingBag size={28} />}
            title="Premium Products"
            desc="Carefully sourced products directly from trusted manufacturers ensuring quality and reliability."
          />

          <FeatureCard
            icon={<Users size={28} />}
            title="Strong Network"
            desc="Build your team through our simple binary system and unlock greater earning opportunities."
          />

          <FeatureCard
            icon={<ShieldCheck size={28} />}
            title="Secure Platform"
            desc="Your earnings and personal data are fully protected with our secure system."
          />

          <FeatureCard
            icon={<Award size={28} />}
            title="Rewards & Recognition"
            desc="Achieve star levels and receive exciting rewards based on your performance."
          />
        </div>

        {/* Vision Section */}
        <div className="mt-20 bg-white rounded-3xl p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-10">
          <div className="md:w-1/2">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Our Vision for 2026
            </h3>

            <p className="text-slate-600 leading-relaxed">
              Our goal is to expand our network to every district in Bangladesh
              by 2026. We aim to reduce unemployment and empower households by
              helping at least one member from each family become a successful
              entrepreneur.
            </p>
          </div>

          {/* Stats */}
          <div className="md:w-1/2 grid grid-cols-2 gap-4 w-full">
            <StatCard number="10K+" label="Active Members" />

            <StatCard number="50+" label="Premium Products" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-slate-100 text-center group">
      <div className="flex justify-center mb-4 text-[#007a55] group-hover:text-[#FF620A] transition-colors">
        {icon}
      </div>

      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>

      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function StatCard({ number, label }) {
  return (
    <div className="bg-[#FF620A]/5 border border-[#FF620A]/20 p-6 rounded-2xl text-center">
      <span className="block text-3xl font-extrabold text-[#FF620A]">
        {number}
      </span>
      <span className="text-slate-500 text-sm">{label}</span>
    </div>
  );
}

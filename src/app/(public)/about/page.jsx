import React from "react";
import { ShoppingBag, Users, ShieldCheck, Award } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">
            আমাদের সম্পর্কে
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            সফল বাংলা: আপনার স্বপ্নের সারথি
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            আমরা বিশ্বাস করি উদ্যোক্তা হবার অধিকার সবার আছে। মানসম্মত পণ্য আর
            সেরা ইনকাম সোর্স নিয়ে আমরা আছি আপনার পাশে।
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<ShoppingBag className="text-green-500" />}
            title="সেরা পণ্য"
            desc="সরাসরি ম্যানুফ্যাকচারার থেকে সংগৃহীত মানসম্মত পণ্যের সমাহার।"
          />
          <FeatureCard
            icon={<Users className="text-blue-500" />}
            title="নেটওয়ার্কিং"
            desc="সহজ বাইনারি সিস্টেমের মাধ্যমে টিম তৈরি করে বড় আয়ের সুযোগ।"
          />
          <FeatureCard
            icon={<ShieldCheck className="text-purple-500" />}
            title="নিরাপদ লেনদেন"
            desc="আপনার প্রতিটি উপার্জিত টাকা এবং তথ্য আমাদের কাছে নিরাপদ।"
          />
          <FeatureCard
            icon={<Award className="text-amber-500" />}
            title="পুরস্কার ও সম্মাননা"
            desc="আপনার পারফরম্যান্স অনুযায়ী স্টার লেভেল এবং আকর্ষণীয় রিওয়ার্ড।"
          />
        </div>

        {/* Mission/Vision Section */}
        <div className="mt-20 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-10">
          <div className="md:w-1/2">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              আমাদের ভিশন ২০২৬
            </h3>
            <p className="text-gray-600 leading-relaxed">
              ২০২৬ সালের মধ্যে আমরা বাংলাদেশের প্রতিটি জেলায় আমাদের নেটওয়ার্ক
              পৌঁছে দিতে চাই। বেকারত্ব দূর করে প্রতিটি ঘরে একজন করে সফল
              উদ্যোক্তা তৈরি করাই আমাদের মূল লক্ষ্য।
            </p>
          </div>
          <div className="md:w-1/2 grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-6 rounded-2xl text-center">
              <span className="block text-3xl font-bold text-green-600">
                ১০কে+
              </span>
              <span className="text-gray-500 text-sm">সক্রিয় মেম্বার</span>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl text-center">
              <span className="block text-3xl font-bold text-blue-600">
                ৫০+
              </span>
              <span className="text-gray-500 text-sm">প্রিমিয়াম পণ্য</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-50 text-center">
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-500 text-sm">{desc}</p>
  </div>
);

export default AboutPage;

"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { getAllCategories } from "@/services/productService";
import { ChevronRight, Loader2, Image as ImageIcon } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";

export default function CategorySlider() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getAllCategories();
        // API থেকে ডেটা যেভাবে আসে সে অনুযায়ী সেট করুন
        setCategories(
          Array.isArray(res.data) ? res.data : res.data.results || [],
        );
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-emerald-500" size={30} />
      </div>
    );

  return (
    <section className="py-6 px-4 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
            Shop By Category
          </h2>
          <div className="h-1 w-12 bg-emerald-500 rounded-full mt-1"></div>
        </div>
        <Link
          href="/shop"
          className="group flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          View All{" "}
          <ChevronRight
            size={18}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      {/* Slider */}
      <Swiper
        modules={[Autoplay, Navigation]}
        spaceBetween={15}
        slidesPerView={3.2} // মোবাইলে ৩টা পুরোপুরি আর ১টা আধা দেখা যাবে (ইঙ্গিত দেয় স্ক্রল করার)
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 4 },
          768: { slidesPerView: 5 },
          1024: { slidesPerView: 7 }, // ডেক্সটপে ৭টা ক্যাটাগরি
        }}
        className="category-swiper"
      >
        {categories.map((cat) => (
          <SwiperSlide key={cat.id}>
            <Link
              href={`/shop?category=${cat.id}`}
              className="group flex flex-col items-center gap-3 text-center"
            >
              {/* Circular Image Wrap */}
              <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-full p-1 bg-white border border-slate-100 shadow-sm group-hover:shadow-md group-hover:border-emerald-500 transition-all duration-300">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-50 flex items-center justify-center">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <ImageIcon className="text-slate-300" size={30} />
                  )}
                </div>
              </div>

              {/* Category Name */}
              <h3 className="text-[11px] md:text-sm font-black text-slate-700 group-hover:text-emerald-600 transition-colors uppercase tracking-tight truncate w-full px-1">
                {cat.name}
              </h3>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { banner } from "@/services/banner";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Banner() {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    banner.getBanners().then((data) => {
      const activeBanners = data.filter((b) => b.is_active);
      setSlides(activeBanners);
    });
  }, []);

  // ডাটা না আসা পর্যন্ত কিছুই রেন্ডার হবে না
  if (slides.length === 0)
    return <div className="w-full h-[260px] bg-gray-100 animate-pulse" />;

  return (
    <div className="w-full h-[260px] sm:h-[320px] md:h-[450px] lg:h-[550px] bg-black overflow-hidden">
      <Swiper
        key={slides.length} // এই কি-টা ম্যাজিকের মতো কাজ করবে, ডাটা আপডেট হলে সোয়াইপারকে রি-মাউন্ট করবে
        modules={[Autoplay, Navigation, Pagination]}
        slidesPerView={1}
        spaceBetween={0}
        loop={slides.length > 1} // স্লাইড ১টার বেশি হলেই কেবল লুপ চলবে
        speed={1000}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        navigation
        pagination={{ clickable: true }}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="w-full h-full flex items-center justify-center bg-black">
              {slide.image ? (
                <img
                  src={slide.image}
                  alt={slide.title || "Banner"}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

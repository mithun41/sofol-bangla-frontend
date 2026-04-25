"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import useSWR from "swr";
import { banner } from "@/services/banner";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// SWR fetcher
const fetcher = () =>
  banner.getBanners().then((data) => data.filter((b) => b.is_active));

export default function Banner() {
  const { data: slides, isLoading } = useSWR("banners", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 120000, // ২ মিনিট cache — banner খুব বেশি বদলায় না
  });

  // Loading skeleton — আগের মতো plain gray box, কিন্তু shimmer effect সহ
  if (isLoading || !slides) {
    return (
      <div className="w-full h-[260px] sm:h-[320px] md:h-[450px] lg:h-[550px] bg-slate-200 animate-pulse relative overflow-hidden">
        {/* shimmer sweep */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <style>{`
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  if (slides.length === 0) return null;

  return (
    <div className="w-full h-[260px] sm:h-[320px] md:h-[450px] lg:h-[550px] bg-black overflow-hidden">
      <Swiper
        key={slides.length}
        modules={[Autoplay, Navigation, Pagination]}
        slidesPerView={1}
        spaceBetween={0}
        loop={slides.length > 1}
        speed={800}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true, // hover করলে auto-play থামবে
        }}
        navigation
        pagination={{ clickable: true }}
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="w-full h-full flex items-center justify-center bg-black">
              {slide.image ? (
                <img
                  src={slide.image}
                  alt={slide.title || "Banner"}
                  className="w-full h-full "
                  // প্রথম banner priority load, বাকিগুলো lazy
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding={index === 0 ? "sync" : "async"}
                  fetchPriority={index === 0 ? "high" : "low"}
                />
              ) : (
                <div className="w-full h-full bg-slate-200" />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

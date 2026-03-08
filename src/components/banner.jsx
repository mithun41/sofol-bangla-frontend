"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const slides = [
  {
    id: 1,
    title: "Exclusive Offer",
    heading: "Experience the Best Quality",
    image: "/images/banner.png",
  },
  {
    id: 2,
    title: "New Season",
    heading: "Smart Choices for Smart People",
    image: "/images/p1.jpg",
  },
  {
    id: 3,
    title: "Join Us",
    heading: "Your Success Starts Here",
    image: "/images/banner.png",
  },
];

export default function Banner() {
  return (
    <div className="w-full relative group">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        loop={true}
        className="w-full h-[380px] sm:h-[480px] md:h-[560px] lg:h-[650px]"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              {/* Background Image */}
              <Image
                src={slide.image}
                alt="banner"
                fill
                priority
                className="object-cover object-center"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent md:bg-black/40"></div>

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-6 md:px-12">
                  <div className="max-w-xs sm:max-w-md md:max-w-2xl text-white">
                    {/* Small Title (Secondary Color) */}
                    <p className="text-sm sm:text-base md:text-lg mb-2 md:mb-4 font-semibold text-[#007A55] uppercase tracking-widest">
                      {slide.title}
                    </p>

                    {/* Heading */}
                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 md:mb-8">
                      {slide.heading}
                    </h1>

                    {/* Primary Button */}
                    <Link
                      href="/shop"
                      className="inline-block bg-[#ff620a] hover:bg-[#e05595] text-white px-6 py-3 md:px-10 md:py-4 rounded-full text-sm md:text-base font-semibold uppercase tracking-wide transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                    >
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Swiper Custom Styles */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          background: white !important;
          opacity: 0.5;
        }

        .swiper-pagination-bullet-active {
          background: #ff620a !important;
          opacity: 1;
          width: 20px;
          border-radius: 5px;
        }

        .swiper-button-next,
        .swiper-button-prev {
          color: #ffffff !important;
          transform: scale(0.7);
          display: none;
        }

        @media (min-width: 768px) {
          .group:hover .swiper-button-next,
          .group:hover .swiper-button-prev {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}

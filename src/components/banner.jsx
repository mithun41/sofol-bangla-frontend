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
        className="w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[650px]"
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

              {/* Dark Gradient Overlay - মোবাইলে লেখা পড়ার সুবিধার জন্য গ্রাডিয়েন্ট বেস্ট */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent md:bg-black/40"></div>

              {/* Content Wrapper */}
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-6 md:px-12">
                  <div className="max-w-[280px] xs:max-w-xs sm:max-w-md md:max-w-2xl text-white">
                    {/* Small Title */}
                    <p className="text-xs md:text-xl mb-2 md:mb-4 font-bold text-emerald-400 uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
                      {slide.title}
                    </p>

                    {/* Main Heading */}
                    <h1 className="text-2xl xs:text-3xl md:text-6xl font-black leading-tight mb-4 md:mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                      {slide.heading}
                    </h1>

                    {/* Button */}
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                      <Link
                        href="/shop"
                        className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 md:px-10 md:py-4 rounded-full text-xs md:text-base font-black uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-emerald-900/20"
                      >
                        Shop Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Styles for Swiper dots/arrows - এগুলা আপনার CSS ফাইলে দিতে পারেন বা এখানে সরাসরি */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          background: white !important;
          opacity: 0.5;
        }
        .swiper-pagination-bullet-active {
          background: #10b981 !important;
          opacity: 1;
          width: 20px;
          border-radius: 5px;
        }
        .swiper-button-next,
        .swiper-button-prev {
          color: white !important;
          transform: scale(0.6);
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

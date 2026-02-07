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
    title: "",
    heading: "",
    image: "/images/banner.png", // public folder e image rakhbe
  },
  {
    id: 2,
    title: "",
    heading: "",
    image: "/images/p1.jpg",
  },
  {
    id: 3,
    title: "",
    heading: "",
    image: "/images/banner.png",
  },
];

export default function Banner() {
  return (
    <div className="w-full">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 4000 }}
        pagination={{ clickable: true }}
        navigation
        loop
        className="w-full h-[450px] md:h-[550px]"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-[500px] md:h-[600px]">
              {/* Background Image */}
              <Image
                src={slide.image}
                alt="banner"
                fill
                priority
                className="object-cover"
              />

              {/* Dark Overlay */}
              {/* <div className="absolute inset-0 bg-black/50"></div> */}

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-6 md:px-12 text-white max-w-2xl">
                  {/* Small Title */}
                  <p className="text-lg md:text-xl mb-3 font-medium text-yellow-400">
                    {slide.title}
                  </p>

                  {/* Main Heading */}
                  <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
                    {slide.heading}
                  </h1>

                  {/* Button */}
                  {/* <Link
                    href="/shop"
                    className="inline-block mt-18 bg-red-600 hover:bg-red-700 transition px-6 py-3 rounded-full text-white font-semibold"
                  >
                    Shop Now
                  </Link> */}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

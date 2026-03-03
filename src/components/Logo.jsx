"use client";

import Image from "next/image";
import Link from "next/link";

export default function Logo({ size = 50 }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/logo.jpeg"
        alt="Company Logo"
        width={size}
        height={size}
        priority
        className="object-contain rounded-lg"
      />
    </Link>
  );
}

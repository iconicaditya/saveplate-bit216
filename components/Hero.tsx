"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const heroImages = [
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1400&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=1400&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&h=600&fit=crop&q=80",
  "https://images.unsplash.com/photo-1484981138541-3d074aa97716?w=1400&h=600&fit=crop&q=80",
];

export default function Hero() {
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeroIndex((current) => (current + 1) % heroImages.length);
    }, 7000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center text-center px-6 py-24 md:py-32 min-h-[60vh] md:min-h-[75vh] lg:min-h-[85vh] overflow-hidden border-b border-gray-100" aria-label="Hero">
      <div className="absolute inset-0 z-0">
        {heroImages.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-all duration-[1200ms] ease-out ${index === heroIndex ? "opacity-100 scale-100" : "opacity-0 scale-[1.1]"}`}
          >
            <Image
              src={src}
              alt="SavePlate hero image"
              fill
              className="object-cover"
              style={{ filter: "grayscale(90%) brightness(0.22)" }}
              priority={index === 0}
              sizes="100vw"
            />
          </div>
        ))}
      </div>
      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/80 mb-6 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[#4CAF50]" aria-hidden="true" />
          Join 10,000+ households reducing food waste
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          Stop Wasting Food.<br />
          <span className="text-[#4CAF50]">Start Saving Money.</span>
        </h1>
        <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto">
          SavePlate helps you track your food inventory, donate surplus items, plan meals, and measure your environmental impact — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-[#4CAF50] text-white font-semibold px-8 py-4 rounded-xl hover:bg-[#3d8c40] transition-colors text-base">
            Get Started Free <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
          <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-medium px-8 py-4 rounded-xl hover:bg-white/20 transition-colors text-base backdrop-blur-sm">
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}

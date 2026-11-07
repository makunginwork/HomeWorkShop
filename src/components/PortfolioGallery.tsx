"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PortfolioItem, PortfolioImage } from "@/types";

type PortfolioWithImages = PortfolioItem & {
  images?: PortfolioImage[];
};

type Props = {
  portfolios: PortfolioWithImages[];
  categoryName: string;
  categoryIcon?: string | null;
};

export default function PortfolioGallery({
  portfolios,
  categoryName,
  categoryIcon,
}: Props) {
  const [selectedPortfolio, setSelectedPortfolio] =
    useState<PortfolioWithImages | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Helper ดึงรูปภาพทั้งหมดของผลงาน
  const getImages = useCallback((item: PortfolioWithImages | null): string[] => {
    if (!item) return [];
    if (item.images && item.images.length > 0) {
      return item.images.map((img) => img.imageUrl);
    }
    if (item.imageUrl) {
      return [item.imageUrl];
    }
    return [];
  }, []);

  const openLightbox = (item: PortfolioWithImages) => {
    setSelectedPortfolio(item);
    setCurrentImageIndex(0);
  };

  const closeLightbox = () => {
    setSelectedPortfolio(null);
    setCurrentImageIndex(0);
  };

  const activeImages = getImages(selectedPortfolio);

  const prevImage = useCallback(() => {
    if (activeImages.length <= 1) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? activeImages.length - 1 : prev - 1
    );
  }, [activeImages.length]);

  const nextImage = useCallback(() => {
    if (activeImages.length <= 1) return;
    setCurrentImageIndex((prev) =>
      prev === activeImages.length - 1 ? 0 : prev + 1
    );
  }, [activeImages.length]);

  // คีย์ลัดแป้นพิมพ์ (ESC, ซ้าย, ขวา)
  useEffect(() => {
    if (!selectedPortfolio) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedPortfolio, prevImage, nextImage]);

  // กรณีไม่มีผลงานในหมวดนี้
  if (portfolios.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-gradient-to-b from-gray-50 to-white rounded-3xl border border-gray-100 max-w-2xl mx-auto shadow-xs">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5 shadow-xs">
          {categoryIcon || "📂"}
        </div>
        <h3 className="text-xl font-bold text-gray-800">
          ยังไม่มีผลงานในหมวด {categoryName}
        </h3>
        <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto leading-relaxed">
          แอดมินกำลังเตรียมอัปเดตผลงานจริงเร็วๆ นี้ คุณสามารถส่งโจทย์ รายละเอียด หรือสอบถามงานหมวดนี้กับทีมงานได้ทันทีครับ
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/contact"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-7 py-3 rounded-full text-sm transition shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            💬 สอบถามหรือสั่งงานทาง LINE
          </Link>
          <Link
            href="/portfolio"
            className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-medium px-6 py-3 rounded-full text-sm transition"
          >
            ← ดูหมวดหมู่อื่น
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Portfolio Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((item) => {
          const itemImages = getImages(item);
          const hasMultipleImages = itemImages.length > 1;

          return (
            <div
              key={item.id}
              onClick={() => openLightbox(item)}
              className="group bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl hover:-translate-y-1 transition duration-300 overflow-hidden cursor-pointer flex flex-col"
            >
              {/* Image Thumbnail */}
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-900">
                {item.imageUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition duration-300" />
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center gap-2 group-hover:scale-105 transition duration-300">
                    <span className="text-5xl">{categoryIcon || "📁"}</span>
                    <span className="text-xs text-blue-600 font-medium">
                      {categoryName}
                    </span>
                  </div>
                )}

                {/* Multiple Images Badge */}
                {hasMultipleImages && (
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium shadow-md border border-white/20">
                    <span>📷</span>
                    <span>{itemImages.length} รูปภาพ</span>
                  </div>
                )}

                {/* Top Category Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-gray-800 text-xs px-2.5 py-1 rounded-full font-medium shadow-sm flex items-center gap-1">
                  <span>{categoryIcon || "📁"}</span>
                  <span>{categoryName}</span>
                </div>
              </div>

              {/* Info Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-2 text-base leading-snug">
                    {item.title}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-3 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>ส่งมอบงานจริง</span>
                  </span>
                  <span className="text-blue-600 font-semibold group-hover:underline flex items-center gap-1">
                    ดูตัวอย่างงาน →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {selectedPortfolio && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-3 right-3 sm:top-5 sm:right-5 text-white/90 hover:text-white bg-white/10 hover:bg-white/25 p-2 rounded-full transition duration-200 z-50 text-xl w-10 h-10 flex items-center justify-center shadow-lg"
            title="ปิดหน้าต่าง (Esc)"
          >
            ✕
          </button>

          {/* Modal Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col md:flex-row relative animate-scale-up border border-white/10"
          >
            {/* Left: Image Carousel (60% width) */}
            <div className="relative md:w-3/5 bg-gray-950 flex flex-col justify-between min-h-[320px] md:min-h-[560px] select-none">
              {/* Image Counter */}
              {activeImages.length > 0 && (
                <div className="p-3 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white z-10">
                  <span className="text-xs text-gray-300 font-medium">
                    {categoryName}
                  </span>
                  <span className="text-xs text-white/90 font-mono bg-black/50 px-2.5 py-0.5 rounded-full">
                    {currentImageIndex + 1} / {activeImages.length}
                  </span>
                </div>
              )}

              {/* Main Image Display */}
              <div className="relative flex-1 flex items-center justify-center p-3 overflow-hidden">
                {activeImages.length > 0 ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeImages[currentImageIndex]}
                      alt={`${selectedPortfolio.title} - รูปที่ ${currentImageIndex + 1}`}
                      className="max-h-[50vh] md:max-h-[66vh] w-auto max-w-full object-contain rounded-lg shadow-2xl transition duration-200"
                    />

                    {/* Previous Button */}
                    {activeImages.length > 1 && (
                      <button
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white w-10 h-10 rounded-full flex items-center justify-center transition shadow-xl text-xl border border-white/20 focus:outline-none"
                        title="รูปก่อนหน้า (ลูกศรซ้าย)"
                      >
                        ‹
                      </button>
                    )}

                    {/* Next Button */}
                    {activeImages.length > 1 && (
                      <button
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white w-10 h-10 rounded-full flex items-center justify-center transition shadow-xl text-xl border border-white/20 focus:outline-none"
                        title="รูปถัดไป (ลูกศรขวา)"
                      >
                        ›
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-16">
                    <span className="text-6xl block mb-2">{categoryIcon || "📁"}</span>
                    <span className="text-sm">ไม่มีรูปภาพประกอบ</span>
                  </div>
                )}
              </div>

              {/* Bottom Thumbnail Strip */}
              {activeImages.length > 1 && (
                <div className="p-3 bg-black/80 backdrop-blur-md flex items-center justify-center gap-2 overflow-x-auto z-10">
                  {activeImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative w-12 h-10 rounded-md overflow-hidden border-2 transition shrink-0 ${
                        idx === currentImageIndex
                          ? "border-blue-500 scale-105 ring-2 ring-blue-400/50"
                          : "border-white/20 opacity-60 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`thumb-${idx}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Portfolio Details (40% width) */}
            <div className="md:w-2/5 p-6 flex flex-col justify-between bg-white overflow-y-auto max-h-[50vh] md:max-h-[560px]">
              <div className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center gap-2">
                  <span className="text-xl">{categoryIcon || "📁"}</span>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    {categoryName}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 leading-snug">
                  {selectedPortfolio.title}
                </h2>

                {/* Description */}
                {selectedPortfolio.description && (
                  <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    {selectedPortfolio.description}
                  </div>
                )}

                {/* Trust Badges */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>ส่งมอบงานตรงเวลา แก้ไขงานได้ตามตกลง</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>รักษาความลับและข้อมูลส่วนบุคคล ปลอดภัย 100%</span>
                  </div>
                </div>
              </div>

              {/* Call To Action Buttons */}
              <div className="pt-6 border-t border-gray-100 space-y-2.5 mt-6">
                <Link
                  href="/contact"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-center"
                >
                  <span>💬 สั่งงานแบบนี้ผ่าน LINE</span>
                </Link>
                <button
                  type="button"
                  onClick={closeLightbox}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl text-xs transition"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

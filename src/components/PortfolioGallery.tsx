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

  // Helper to get all images for selected portfolio
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

  // Handle keyboard events (ESC, Left, Right)
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
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedPortfolio, prevImage, nextImage]);

  if (portfolios.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
        <p className="text-5xl mb-4">📂</p>
        <p className="text-gray-600 font-medium text-lg">ยังไม่มีผลงานในหมวดนี้</p>
        <p className="text-gray-400 text-sm mt-1">
          คุณสามารถติดต่อสอบถามหรือสั่งงานโดยตรงได้ทันที
        </p>
        <Link
          href="/contact"
          className="mt-5 inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-full text-sm transition shadow-sm"
        >
          ติดต่อสอบถามงาน
        </Link>
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
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 overflow-hidden cursor-pointer flex flex-col"
            >
              {/* Image or Icon Fallback */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                {item.imageUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/25 transition duration-300" />
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center gap-2 group-hover:scale-105 transition duration-300">
                    <span className="text-5xl">{categoryIcon || "📁"}</span>
                    <span className="text-xs text-blue-600 font-medium">
                      {categoryName}
                    </span>
                  </div>
                )}

                {/* Multiple Images Badge (like IG) */}
                {hasMultipleImages && (
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium shadow-sm">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{itemImages.length}</span>
                  </div>
                )}

                {/* Hover overlay hint */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none">
                  <span className="bg-white/90 text-gray-900 text-xs font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                    🔍 คลิกเพื่อเปิดดูรายละเอียด
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium mb-1.5">
                    <span>{categoryIcon || "📁"}</span>
                    <span>{categoryName}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-2 text-base">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>ตัวอย่างงานจริง</span>
                  <span className="text-blue-600 font-medium group-hover:underline flex items-center gap-1">
                    ดูโพสต์แบบเต็ม →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Instagram-Style Post Modal (Lightbox) */}
      {selectedPortfolio && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={closeLightbox}
        >
          {/* Close Button Top Right */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition duration-200 z-50 text-xl w-10 h-10 flex items-center justify-center"
            title="ปิด (Esc)"
          >
            ✕
          </button>

          {/* Modal Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col md:flex-row relative animate-scale-up"
          >
            {/* Left: Image Carousel */}
            <div className="relative md:w-3/5 bg-gray-950 flex flex-col items-center justify-center min-h-[320px] md:min-h-[540px] select-none">
              {activeImages.length > 0 ? (
                <>
                  <div className="w-full h-full flex items-center justify-center p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeImages[currentImageIndex]}
                      alt={`${selectedPortfolio.title} - ${currentImageIndex + 1}`}
                      className="max-h-[60vh] md:max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-inner"
                    />
                  </div>

                  {/* Previous Button */}
                  {activeImages.length > 1 && (
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white w-10 h-10 rounded-full flex items-center justify-center transition shadow-lg text-lg focus:outline-none"
                      title="รูปก่อนหน้า (ปุ่มลูกศรซ้าย)"
                    >
                      ‹
                    </button>
                  )}

                  {/* Next Button */}
                  {activeImages.length > 1 && (
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white w-10 h-10 rounded-full flex items-center justify-center transition shadow-lg text-lg focus:outline-none"
                      title="รูปถัดไป (ปุ่มลูกศรขวา)"
                    >
                      ›
                    </button>
                  )}

                  {/* Counter Pill */}
                  {activeImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-xs px-3.5 py-1.5 rounded-full font-mono flex items-center gap-1.5 shadow-md">
                      <span>{currentImageIndex + 1}</span>
                      <span className="text-white/50">/</span>
                      <span>{activeImages.length}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-12 text-center text-white/80 flex flex-col items-center gap-3">
                  <span className="text-7xl">{categoryIcon || "📁"}</span>
                  <p className="text-lg font-medium">{categoryName}</p>
                  <p className="text-xs text-gray-400">
                    งานประเภทเอกสาร/ข้อมูล (ไม่มีไฟล์รูปภาพตัวอย่าง)
                  </p>
                </div>
              )}
            </div>

            {/* Right: Portfolio Details & Interactive Actions */}
            <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[85vh] bg-white">
              <div className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{categoryIcon || "📁"}</span>
                    <div>
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                        {categoryName}
                      </p>
                      <p className="text-xs text-gray-400">
                        โพสต์ตัวอย่างผลงาน
                      </p>
                    </div>
                  </div>
                  <span className="bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
                    ✓ ตรวจสอบแล้ว
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-snug">
                    {selectedPortfolio.title}
                  </h2>
                </div>

                {/* Full Description */}
                {selectedPortfolio.description && (
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                    {selectedPortfolio.description}
                  </div>
                )}

                {/* Key Service Highlights */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    จุดเด่นบริการ
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>ส่งมอบงานตรงเวลา มีแบบร่างให้ตรวจสอบ</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>แก้ไขงานได้ตามความต้องการ ปรับแต่งได้</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>รักษาความลับของลูกค้าและข้อมูล 100%</span>
                    </li>
                  </ul>
                </div>

                {/* Thumbnails list if multiple images */}
                {activeImages.length > 1 && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-gray-400 mb-2">
                      รูปภาพทั้งหมดในโพสต์นี้ ({activeImages.length})
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {activeImages.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition ${
                            currentImageIndex === idx
                              ? "border-blue-600 ring-2 ring-blue-100"
                              : "border-gray-200 opacity-60 hover:opacity-100"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt="thumbnail"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-6 mt-6 border-t border-gray-100 space-y-2.5">
                <Link
                  href="/contact"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl text-center text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span>💬</span>
                  <span>สนใจสั่งงานแบบนี้ ทักแชท LINE เลย</span>
                </Link>
                <button
                  onClick={closeLightbox}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2 px-4 rounded-xl text-center text-xs transition"
                >
                  ปิดหน้าต่างนี้
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

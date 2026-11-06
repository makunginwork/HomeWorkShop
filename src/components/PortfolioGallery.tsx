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

// Helper: ให้ชื่อขั้นตอนที่เป็นมาตรฐานตามจำนวนรูป
function getStepInfo(index: number, total: number) {
  if (total >= 5) {
    const steps = [
      {
        short: "1. ปก",
        full: "ขั้นตอนที่ 1: หน้าปกและหัวข้อเรื่อง (Cover & Project Overview)",
        desc: "หน้าปกมาตรฐานวิชาการ/องค์กร ปิดชื่อและข้อมูลส่วนบุคคล 100%",
        badge: "ปกวิชาการ",
      },
      {
        short: "2. สารบัญ",
        full: "ขั้นตอนที่ 2: สารบัญและโครงสร้างเนื้อหา (Table of Contents / Outline)",
        desc: "จัดหมวดหมู่สารบัญเนื้อหา ตาราง และภาพประกอบอย่างเป็นระบบ",
        badge: "สารบัญ/โครงร่าง",
      },
      {
        short: "3. เนื้อหา/สูตร",
        full: "ขั้นตอนที่ 3: ตัวอย่างเนื้อหาจริง / สูตรการคำนวณ / แผ่นงานหลัก (Core Content & Formulas)",
        desc: "เนื้อหาเข้มข้น ค้นคว้า อ้างอิงหลักการ หรือผูกสูตรคำนวณ Excel สมบูรณ์",
        badge: "เนื้อหา & การคำนวณ",
      },
      {
        short: "4. ตาราง/ผลลัพธ์",
        full: "ขั้นตอนที่ 4: ตารางผลลัพธ์ / แบบจำลองสรุปข้อมูล (Summary Tables & Models)",
        desc: "แบบจำลองทางการเงิน กราฟิกสถิติ หรือตารางสรุปตัวเลขเชิงลึก",
        badge: "ตารางผลลัพธ์",
      },
      {
        short: "5. สรุป/อ้างอิง",
        full: "ขั้นตอนที่ 5: บทสรุป / ข้อเสนอแนะ / เอกสารอ้างอิง (Executive Summary & References)",
        desc: "สรุปผลการวิเคราะห์ ข้อเสนอแนะเชิงบริหาร และบรรณานุกรมตามระบบ APA",
        badge: "บทสรุป & อ้างอิง",
      },
    ];
    return steps[index] || {
      short: `${index + 1}. รายละเอียด`,
      full: `ขั้นตอนที่ ${index + 1}: รายละเอียดเพิ่มเติม (${index + 1}/${total})`,
      desc: "เอกสารและแผ่นงานประกอบเพิ่มเติม",
      badge: "เอกสารเพิ่มเติม",
    };
  }

  if (total === 4) {
    const steps = [
      {
        short: "1. ปก/สมมติฐาน",
        full: "ขั้นตอนที่ 1: หน้าปกและตัวแปรสมมติฐาน (Cover & Assumptions)",
        desc: "ภาพรวมโครงการและการกำหนดตัวแปรตั้งต้น",
        badge: "ปก/สมมติฐาน",
      },
      {
        short: "2. ตารางข้อมูล",
        full: "ขั้นตอนที่ 2: โครงสร้างตารางและชีทข้อมูลหลัก (Structure & Model Sheet)",
        desc: "การวางโครงสร้างตารางข้อมูลและการจำแนกหมวดหมู่",
        badge: "ตารางข้อมูล",
      },
      {
        short: "3. แบบจำลองคำนวณ",
        full: "ขั้นตอนที่ 3: แบบจำลองการคำนวณและสูตรวิเคราะห์ (Calculations & Schedules)",
        desc: "การผูกสูตรไดนามิกและการประมวลผลตัวเลข",
        badge: "โมเดลคำนวณ",
      },
      {
        short: "4. ผลลัพธ์/สรุป",
        full: "ขั้นตอนที่ 4: ผลลัพธ์การวิเคราะห์และการส่งมอบ (Summary & Deliverables)",
        desc: "ตารางสรุปผลลัพธ์ ข้อเสนอแนะ และรูปแบบการส่งมอบงาน",
        badge: "ผลลัพธ์/สรุป",
      },
    ];
    return steps[index] || {
      short: `${index + 1}. ขั้นตอน`,
      full: `ขั้นตอนที่ ${index + 1} (${index + 1}/${total})`,
      desc: "รายละเอียดเอกสารประกอบ",
      badge: "ขั้นตอน",
    };
  }

  if (total === 3) {
    const steps = [
      {
        short: "1. ปก/บทนำ",
        full: "ขั้นตอนที่ 1: หน้าปกและบทนำ (Cover & Introduction)",
        desc: "หน้าปกและภาพรวมโครงการ",
        badge: "ปก/บทนำ",
      },
      {
        short: "2. สารบัญ/เนื้อหา",
        full: "ขั้นตอนที่ 2: สารบัญและเนื้อหาหลัก (TOC & Core Work)",
        desc: "โครงสร้างสารบัญและตัวอย่างเนื้อหางานจริง",
        badge: "สารบัญ/เนื้อหา",
      },
      {
        short: "3. สรุป/อ้างอิง",
        full: "ขั้นตอนที่ 3: บทสรุปและเอกสารอ้างอิง (Summary & References)",
        desc: "บทสรุปผลการศึกษาและรายการอ้างอิง",
        badge: "สรุป/อ้างอิง",
      },
    ];
    return steps[index] || {
      short: `${index + 1}. ขั้นตอน`,
      full: `ขั้นตอนที่ ${index + 1} (${index + 1}/${total})`,
      desc: "รายละเอียดเอกสาร",
      badge: "ขั้นตอน",
    };
  }

  // 1-2 images
  return {
    short: `${index + 1}. หน้าตัวอย่าง`,
    full: `ขั้นตอนที่ ${index + 1}: ตัวอย่างเอกสารจริง (${index + 1}/${total})`,
    desc: "ภาพประกอบเอกสารงานจริง ปิดชื่อข้อมูลส่วนบุคคล",
    badge: "ตัวอย่างงานจริง",
  };
}

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

  // Keyboard Navigation (ESC, Left, Right)
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

  // Format Badges Helper
  const getDeliverableBadges = (title: string, desc: string) => {
    const text = (title + " " + desc).toLowerCase();
    const badges = [];

    if (text.includes("excel") || text.includes(".xlsx") || text.includes("cvp") || text.includes("ตาราง") || text.includes("งบประมาณ")) {
      badges.push({ name: "ไฟล์ Excel (.xlsx) ผูกสูตรสมบูรณ์", color: "bg-emerald-50 text-emerald-700 border-emerald-200" });
    }
    if (text.includes("word") || text.includes("รายงาน") || text.includes("ภาคนิพนธ์") || text.includes("apa") || text.includes("สารบัญ")) {
      badges.push({ name: "รายงาน Word (.docx) จัดหน้าตามเกณฑ์", color: "bg-blue-50 text-blue-700 border-blue-200" });
    }
    if (text.includes("สไลด์") || text.includes("canva") || text.includes("powerpoint") || text.includes("นำเสนอ")) {
      badges.push({ name: "สไลด์ PowerPoint & Canva", color: "bg-purple-50 text-purple-700 border-purple-200" });
    }
    if (text.includes("spss") || text.includes("สถิติ") || text.includes("anova") || text.includes("regression")) {
      badges.push({ name: "สถิติ SPSS (.sav/.spv)", color: "bg-amber-50 text-amber-700 border-amber-200" });
    }

    badges.push({ name: "ปลอดภัย ปิดชื่อ 100%", color: "bg-slate-50 text-slate-700 border-slate-200" });
    return badges;
  };

  return (
    <div>
      {/* Portfolio Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((item) => {
          const itemImages = getImages(item);
          const hasMultipleImages = itemImages.length > 1;
          const badges = getDeliverableBadges(item.title, item.description || "");

          return (
            <div
              key={item.id}
              onClick={() => openLightbox(item)}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 overflow-hidden cursor-pointer flex flex-col"
            >
              {/* Image Thumbnail with Overlay */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-950">
                {item.imageUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 group-hover:from-black/75 transition duration-300" />
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center gap-2 group-hover:scale-105 transition duration-300">
                    <span className="text-5xl">{categoryIcon || "📁"}</span>
                    <span className="text-xs text-blue-600 font-medium">
                      {categoryName}
                    </span>
                  </div>
                )}

                {/* Multiple Images / Steps Badge */}
                {hasMultipleImages && (
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium shadow-md border border-white/20">
                    <span>📑</span>
                    <span>{itemImages.length} ขั้นตอน</span>
                  </div>
                )}

                {/* Top Category Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-gray-800 text-xs px-2.5 py-1 rounded-full font-medium shadow-sm flex items-center gap-1">
                  <span>{categoryIcon || "📁"}</span>
                  <span>{categoryName}</span>
                </div>

                {/* Bottom Step Flow Indicators */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/90">
                  <span className="bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md font-mono">
                    ปก · สารบัญ · เนื้อหา · ตาราง · สรุป
                  </span>
                  <span className="bg-blue-600/90 text-white font-medium px-2 py-0.5 rounded-md text-[10px] shadow">
                    กดดูภาพเต็ม →
                  </span>
                </div>
              </div>

              {/* Info Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-2 text-base leading-snug">
                    {item.title}
                  </h3>

                  {/* Format Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {badges.slice(0, 2).map((b, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${b.color}`}
                      >
                        {b.name}
                      </span>
                    ))}
                  </div>

                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                      {item.description.replace(/•/g, "").slice(0, 120)}...
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>ตรวจทานความถูกต้องแล้ว</span>
                  </span>
                  <span className="text-blue-600 font-semibold group-hover:underline">
                    เปิดดูงาน {itemImages.length > 0 ? `(${itemImages.length} หน้า)` : ""}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Instagram-Style Post Modal (Lightbox with 5-Step Presentation) */}
      {selectedPortfolio && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={closeLightbox}
        >
          {/* Close Button Top Right */}
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
            className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl max-w-6xl w-full max-h-[94vh] flex flex-col md:flex-row relative animate-scale-up border border-white/10"
          >
            {/* Left: Image Carousel & Step Controller (60% width) */}
            <div className="relative md:w-3/5 bg-gray-950 flex flex-col justify-between min-h-[380px] md:min-h-[600px] select-none">
              {/* Top Step Banner Overlay */}
              {activeImages.length > 0 && (
                <div className="p-3 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between text-white z-10">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                      {getStepInfo(currentImageIndex, activeImages.length).badge}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-gray-100 truncate max-w-[280px] sm:max-w-[360px]">
                      {getStepInfo(currentImageIndex, activeImages.length).full}
                    </span>
                  </div>
                  <span className="text-xs text-gray-300 font-mono bg-black/50 px-2 py-0.5 rounded">
                    {currentImageIndex + 1}/{activeImages.length}
                  </span>
                </div>
              )}

              {/* Main Image Display */}
              <div className="relative flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
                {activeImages.length > 0 ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeImages[currentImageIndex]}
                      alt={`${selectedPortfolio.title} - ขั้นตอนที่ ${currentImageIndex + 1}`}
                      className="max-h-[52vh] md:max-h-[68vh] w-auto max-w-full object-contain rounded-md shadow-2xl transition duration-200"
                    />

                    {/* Previous Button */}
                    {activeImages.length > 1 && (
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition shadow-xl text-xl sm:text-2xl border border-white/20 focus:outline-none"
                        title="ดูขั้นตอนก่อนหน้า (ลูกศรซ้าย)"
                      >
                        ‹
                      </button>
                    )}

                    {/* Next Button */}
                    {activeImages.length > 1 && (
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition shadow-xl text-xl sm:text-2xl border border-white/20 focus:outline-none"
                        title="ดูขั้นตอนถัดไป (ลูกศรขวา)"
                      >
                        ›
                      </button>
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

              {/* Bottom Interactive Step Navigation Bar */}
              {activeImages.length > 1 && (
                <div className="p-2.5 bg-gray-900 border-t border-gray-800 flex flex-wrap items-center justify-center gap-1.5 z-10">
                  {activeImages.map((_, idx) => {
                    const info = getStepInfo(idx, activeImages.length);
                    const isActive = currentImageIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition duration-150 flex items-center gap-1 ${
                          isActive
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400 font-semibold"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`}
                      >
                        <span>{info.short}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Portfolio Details & Interactive Step Outline (40% width) */}
            <div className="md:w-2/5 p-5 md:p-7 flex flex-col justify-between overflow-y-auto max-h-[46vh] md:max-h-[94vh] bg-white">
              <div className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{categoryIcon || "📁"}</span>
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                        {categoryName}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        โพสต์ตัวอย่างงานจริงฉบับสมบูรณ์
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <span>✓</span>
                    <span>ปิดชื่อ 100%</span>
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-snug">
                    {selectedPortfolio.title}
                  </h2>
                </div>

                {/* Deliverable Format Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {getDeliverableBadges(
                    selectedPortfolio.title,
                    selectedPortfolio.description || ""
                  ).map((badge, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2.5 py-1 rounded-md border font-medium ${badge.color}`}
                    >
                      {badge.name}
                    </span>
                  ))}
                </div>

                {/* Interactive 5-Step Structure Outline */}
                {activeImages.length > 1 && (
                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <span>📑</span>
                        <span>ขั้นตอนการจัดทำงาน (คลิกดูภาพแต่ละหน้า):</span>
                      </p>
                      <span className="text-[10px] text-blue-600 font-medium">
                        {activeImages.length} ขั้นตอน
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {activeImages.map((_, idx) => {
                        const info = getStepInfo(idx, activeImages.length);
                        const isCurrent = currentImageIndex === idx;

                        return (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between ${
                              isCurrent
                                ? "bg-blue-600 text-white font-semibold shadow-sm"
                                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60"
                            }`}
                          >
                            <span className="truncate pr-2">{info.full}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded ${
                                isCurrent
                                  ? "bg-white/20 text-white"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              หน้า {idx + 1}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Full Description */}
                {selectedPortfolio.description && (
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-gray-700 text-xs md:text-sm leading-relaxed whitespace-pre-line">
                    <p className="font-semibold text-gray-900 mb-1.5">
                      รายละเอียดงานและสาระสำคัญ:
                    </p>
                    {selectedPortfolio.description}
                  </div>
                )}

                {/* Service Quality Standards */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    มาตรฐานการส่งมอบงาน
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>จัดส่งไฟล์ต้นฉบับ (.xlsx / .docx / .pptx) สามารถแก้ไขต่อได้</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>สูตรคำนวณผูกโยงถูกต้องตามหลักวิชาชีพและคู่มือสถาบัน</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>รักษาความลับของลูกค้า 100% ไม่มีข้อมูลรั่วไหล</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
                <Link
                  href="/contact"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl text-center text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span>💬</span>
                  <span>สนใจสั่งงานประเภทนี้ ทักแชทสอบถามทันที</span>
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
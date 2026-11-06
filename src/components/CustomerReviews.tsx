"use client";

import React, { useState, useEffect } from "react";
import { Review } from "@/types";

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [comment, setComment] = useState("");
  const [lineUid, setLineUid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!authorName.trim()) {
      setFormError("กรุณากรอกชื่อของคุณ");
      return;
    }

    if (!comment.trim()) {
      setFormError("กรุณากรอกข้อความรีวิว");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: authorName.trim(),
          rating,
          comment: comment.trim(),
          lineUid: lineUid.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error || "ไม่สามารถส่งรีวิวได้");
        return;
      }

      setSubmitSuccess(true);
      setComment("");
      setAuthorName("");
      setLineUid("");
      setRating(5);
      await fetchReviews();

      setTimeout(() => {
        setSubmitSuccess(false);
        setShowForm(false);
      }, 3500);
    } catch {
      setFormError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
        ).toFixed(1)
      : "5.0";

  return (
    <div className="space-y-8">
      {/* Header & Rating Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 sm:p-8 rounded-3xl border border-blue-100/60 shadow-sm">
        <div className="text-center sm:text-left space-y-2">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-3xl font-extrabold text-gray-900 font-mono">
              {averageRating}
            </span>
            <div className="flex text-amber-400 text-xl tracking-tight">
              {"★★★★★".slice(0, Math.round(Number(averageRating)))}
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-0.5 rounded-full">
              เต็ม 5.0
            </span>
          </div>
          <p className="text-sm text-gray-600">
            จากความประทับใจของลูกค้าที่ใช้บริการจริง ({reviews.length} รีวิว)
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-full text-sm transition shadow-md hover:shadow-lg flex items-center gap-2 flex-shrink-0"
        >
          <span>✍️</span>
          <span>{showForm ? "ปิดแบบฟอร์มรีวิว" : "เขียนรีวิว / ให้คะแนน"}</span>
        </button>
      </div>

      {/* Review Form (Expandable) */}
      {showForm && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xl transition animate-scale-up">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                เขียนรีวิวความประทับใจ
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                ความคิดเห็นของคุณมีความหมายอย่างยิ่งในการพัฒนาบริการของเรา
              </p>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 text-lg w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {submitSuccess ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-2xl text-center space-y-2">
              <p className="text-4xl">🎉</p>
              <h4 className="font-bold text-base">ขอบคุณสำหรับรีวิวของคุณ!</h4>
              <p className="text-xs text-green-600">
                รีวิวของคุณถูกบันทึกและแสดงผลบนเว็บไซต์เรียบร้อยแล้ว
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  ให้คะแนนความพึงพอใจ *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-3xl transition transform hover:scale-110 focus:outline-none"
                    >
                      <span
                        className={
                          (hoverRating || rating) >= star
                            ? "text-amber-400"
                            : "text-gray-300"
                        }
                      >
                        ★
                      </span>
                    </button>
                  ))}
                  <span className="text-sm font-semibold text-gray-700 ml-2">
                    {rating} จาก 5 ดาว
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Author Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ชื่อของคุณ หรือ ชื่อเล่น *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น: น้องมายด์, คุณนนท์"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>

                {/* Optional LINE UID */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    LINE UID หรือชื่อ LINE (ไม่บังคับ)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น: U123456... หรือ @ชื่อไลน์"
                    value={lineUid}
                    onChange={(e) => setLineUid(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  ข้อความรีวิว *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="เล่าประสบการณ์ เช่น งานส่งตรงเวลา ความถูกต้อง บริการเป็นกันเอง..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-400 outline-none leading-relaxed"
                />
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl p-3">
                  ⚠️ {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? "กำลังส่งรีวิว..." : "ส่งรีวิว"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Reviews Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse space-y-3"
            >
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">💬</p>
          <p className="text-sm">ยังไม่มีรีวิว ร่วมเป็นคนแรกที่เขียนรีวิวให้เรา!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: Stars & Verified Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400 text-sm tracking-tight">
                    {"★★★★★".slice(0, r.rating)}
                  </div>
                  <span className="text-[11px] bg-green-50 text-green-700 font-medium px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
                    <span>✓</span>
                    <span>ผู้ใช้บริการจริง</span>
                  </span>
                </div>

                {/* Comment */}
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  &ldquo;{r.comment}&rdquo;
                </p>
              </div>

              {/* Author footer */}
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
                <span className="font-semibold text-gray-800">
                  {r.authorName}
                </span>
                <span>
                  {new Date(r.createdAt).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

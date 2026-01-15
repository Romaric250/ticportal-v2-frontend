"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export function ImageCarousel({ images, isOpen, onClose, initialIndex = 0 }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen || images.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 cursor-pointer rounded-full bg-black/50 backdrop-blur-sm p-2 sm:p-2.5 text-white hover:bg-black/70 transition"
      >
        <X size={20} className="sm:w-6 sm:h-6" />
      </button>

      {/* Previous Button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToPrevious();
          }}
          className="absolute left-2 sm:left-4 z-10 cursor-pointer rounded-full bg-black/50 backdrop-blur-sm p-2 sm:p-2.5 text-white hover:bg-black/70 transition"
        >
          <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
        </button>
      )}

      {/* Image Container */}
      <div
        className="relative max-w-[95vw] sm:max-w-[90vw] max-h-[95vh] sm:max-h-[90vh] flex items-center justify-center px-2 sm:px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1} of ${images.length}`}
          className="max-w-full max-h-[95vh] sm:max-h-[90vh] object-contain rounded-lg"
        />

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="absolute bottom-12 sm:bottom-16 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2 max-w-[95vw] sm:max-w-[90vw] overflow-x-auto px-2 sm:px-4 scrollbar-hide">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition ${
                  currentIndex === index
                    ? "border-white scale-110"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Next Button */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          className="absolute right-2 sm:right-4 z-10 cursor-pointer rounded-full bg-black/50 backdrop-blur-sm p-2 sm:p-2.5 text-white hover:bg-black/70 transition"
        >
          <ChevronRight size={20} className="sm:w-6 sm:h-6" />
        </button>
      )}
    </div>
  );
}

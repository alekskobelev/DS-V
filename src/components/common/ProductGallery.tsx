import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductGalleryProps {
  image: string;
  gallery?: string[];
  videoUrl?: string;
  alt: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ image, gallery = [], videoUrl, alt }) => {
  const images = [image, ...gallery];
  const totalMedia = images.length + (videoUrl ? 1 : 0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalMedia);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalMedia) % totalMedia);
  };

  const isVideo = videoUrl && currentIndex === totalMedia - 1;

  const renderVideo = (url: string) => {
    // Simple naive parser for YouTube
    let embedUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
      embedUrl = url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
      embedUrl = url.replace('youtu.be/', 'youtube.com/embed/');
    }

    if (embedUrl.includes('youtube.com/embed') || embedUrl.includes('vimeo.com')) {
      return (
        <iframe
          src={embedUrl}
          className="w-full h-full object-cover"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      );
    }
    return (
      <video src={url} controls className="w-full h-full object-cover bg-black" />
    );
  };

  return (
    <div className="relative w-full h-80 bg-gray-100 rounded-xl overflow-hidden shadow-md border border-gray-100 group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full absolute inset-0"
        >
          {isVideo ? (
            renderVideo(videoUrl!)
          ) : (
            <img
              src={images[currentIndex]}
              alt={`${alt} - view ${currentIndex + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {totalMedia > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur shadow hover:bg-white flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur shadow hover:bg-white flex items-center justify-center text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/20 backdrop-blur-md px-2 py-1 rounded-full">
            {Array.from({ length: totalMedia }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentIndex === idx ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                }`}
                title={videoUrl && idx === totalMedia - 1 ? 'Видео' : `Изображение ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Marker } from './Marker';

const BackgroundCarousel = ({ images, interval = 5000 }) => {
  const [[page, direction], setPage] = useState([0, 1]); // [index, direction (1 for right, -1 for left)]
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const paginate = useCallback((newDirection) => {
    setPage(([prevPage]) => {
      const nextPage = (prevPage + newDirection + images.length) % images.length;
      return [nextPage, newDirection];
    });
  }, [images.length]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => paginate(1), interval); // Default auto-play is right (1)
    return () => clearInterval(timer);
  }, [interval, isAutoPlaying, paginate]);

  const goToSlide = (index) => {
    const newDirection = index > page ? 1 : -1;
    setPage([index, newDirection]);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const handleManualNext = () => {
    paginate(1);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const handleManualPrev = () => {
    paginate(-1);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Variants that respond to direction
  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? "-100%" : "100%", // Comes from left if moving right, from right if moving left
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 0.4,
      transition: {
        x: { type: "tween", duration: 1, ease: "easeInOut" },
        opacity: { duration: 0.8 }
      }
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction > 0 ? "100%" : "-100%", // Exits to right if moving right, to left if moving left
      opacity: 0,
      transition: {
        x: { type: "tween", duration: 1, ease: "easeInOut" },
        opacity: { duration: 0.8 }
      }
    })
  };

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black group">
      {/* Background Images with directional transitions */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('${images[page]}')`,
          }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-black/40 z-[1]" />

      {/* Navigation Arrows */}
      <button
        onClick={handleManualPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
        aria-label="Previous image"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={handleManualNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
        aria-label="Next image"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none">
        <div className="text-center text-white max-w-lg px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mb-6"
          >
            <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-wide">
              Welcome to <Marker className='text-[#ff3a66] font-bold text-5xl'> Axile</Marker>
            </h2>
            <p className="text-lg text-gray-300 font-light leading-relaxed">
              Discover amazing events and create unforgettable experiences
            </p>
          </motion.div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === page
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BackgroundCarousel;

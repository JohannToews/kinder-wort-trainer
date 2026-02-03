import { useRef } from "react";

interface HorizontalImageCarouselProps {
  images: string[];
  direction?: "left" | "right";
  speed?: number; // seconds for full cycle
  imageSize?: "small" | "medium" | "large";
  className?: string;
  filterColor?: string; // CSS color for monochromatic overlay
}

const HorizontalImageCarousel = ({ 
  images, 
  direction = "left", 
  speed = 40,
  imageSize = "large",
  className = "",
  filterColor
}: HorizontalImageCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const sizeClasses = {
    small: "w-16 h-12 md:w-20 md:h-14",
    medium: "w-20 h-14 md:w-24 md:h-16",
    large: "w-24 h-16 md:w-28 md:h-20"
  };

  // Duplicate images for seamless loop
  const duplicatedImages = [...images, ...images, ...images];

  return (
    <div 
      ref={containerRef}
      className={`overflow-hidden relative ${className}`}
      style={{ maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)" }}
    >
      <div 
        className={`flex flex-row gap-3 ${direction === "left" ? "animate-scroll-left" : "animate-scroll-right"}`}
        style={{ 
          animationDuration: `${speed}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite"
        }}
      >
        {duplicatedImages.map((src, idx) => (
          <div 
            key={idx} 
            className={`${sizeClasses[imageSize]} rounded-xl overflow-hidden shadow-md flex-shrink-0 relative`}
          >
            <img 
              src={src} 
              alt="" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {/* Monochromatic overlay filter */}
            {filterColor && (
              <div 
                className="absolute inset-0 mix-blend-color opacity-70"
                style={{ backgroundColor: filterColor }}
              />
            )}
            {/* Additional desaturation overlay */}
            <div className="absolute inset-0 bg-background/30" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalImageCarousel;

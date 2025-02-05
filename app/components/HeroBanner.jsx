import React, { useEffect, useRef, useState } from "react";

const HeroBanner = () => {
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef(null);
  const imageRef = useRef(null);

  // Show Video After 1 Second
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowVideo(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Play Video When State Updates
  useEffect(() => {
    if (showVideo && videoRef.current) {
      videoRef.current
        .play()
        .catch((error) => console.error("Video playback failed:", error));
    }
  }, [showVideo]);

  // Parallax Effect for Image & Video
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const parallaxOffset = scrollY * 0.3; // Adjust Parallax Speed

      if (videoRef.current) {
        videoRef.current.style.transform = `translateY(${parallaxOffset}px)`;
      }

      if (imageRef.current) {
        imageRef.current.style.transform = `translateY(${parallaxOffset / 2}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showVideo]);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background Image for Desktop & Mobile */}
      {!showVideo && (
        <div
          ref={imageRef}
          className="absolute inset-0 w-full h-full bg-center bg-cover transition-transform duration-300 ease-out"
        >
          <picture>
            {/* Mobile Image (max: 767px) */}
            <source
              media="(max-width: 767px)"
              srcSet="https://cdn.shopify.com/oxygen-v2/25850/10228/21102/1365028/build/_assets/superhero-backup-mobile-WFQRWN2I.jpg"
            />
            {/* Desktop Image (768px and up) */}
            <img
              src="https://cdn.shopify.com/oxygen-v2/25850/10228/21102/1365028/build/_assets/superhero-backup-desktop-3AQOELGR.jpg"
              alt="Hero Banner"
              className="w-full h-full object-cover"
            />
          </picture>
        </div>
      )}

      {/* Video with Parallax Effect */}
      {showVideo && (
        <div className="absolute inset-0 overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover transition-transform duration-300 ease-out"
            autoPlay
            muted
            loop
            playsInline
          >
            <source
              src="https://cdn.shopify.com/videos/c/o/v/9fdb033e17424e2fb537f5b370d92d43.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </section>
  );
};

export default HeroBanner;

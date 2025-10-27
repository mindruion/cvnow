import React, { useState, useEffect } from "react";

const Skeleton = ({ className = "", ...props }) => (
  <div
    className={`animate-pulse bg-gray-200 ${className}`}
    {...props}
  />
);

const ThemePreviewCard = ({ 
  themeMode, 
  activePalette, 
  activeGradient, 
  heroContent,
  className = "" 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setShowContent(false);
    
    const loadingDuration = Math.random() * 200 + 200; // 200-400ms
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShowContent(true);
    }, loadingDuration);

    return () => clearTimeout(timer);
  }, [themeMode, activePalette, activeGradient]);

  const previewStyle = activeGradient
    ? {
        background: `linear-gradient(${activeGradient.angle}deg, ${activeGradient.stops.join(", ")})`,
        color: activePalette?.text || "#111111",
      }
    : {
        background: activePalette?.background || "#F3F6F6",
        color: activePalette?.text || "#111111",
      };

  return (
    <div className={`rounded-2xl border bg-card shadow-sm p-6 ${className}`}>
      <div
        className="theme-live-preview"
        style={{
          borderRadius: 16,
          padding: 24,
          border: "1px solid rgba(0,0,0,0.05)",
          ...previewStyle,
        }}
      >
        {isLoading ? (
          <Skeleton className="h-[140px] rounded-xl" />
        ) : (
          <div
            className={`preview-card ${showContent ? 'preview-content-visible' : 'preview-content-hidden'}`}
            style={{
              background: activePalette?.surface || "#FFFFFF",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 12px 32px rgba(17, 17, 17, 0.08)",
              color: activePalette?.text || "#111111",
            }}
          >
            <span className="chip mb-2">{heroContent?.greeting}</span>
            <h4 className="mb-1">{heroContent?.headline}</h4>
            <h6 className="text-muted mb-3">{heroContent?.subtitle}</h6>
            <p className="mb-0">{heroContent?.summary}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemePreviewCard;

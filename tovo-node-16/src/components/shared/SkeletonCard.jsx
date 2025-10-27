import React from "react";

const SkeletonCard = ({ 
  className = "",
  height = "320px",
  showText = true 
}) => {
  return (
    <div 
      className={`card inner-card theme-preset-card skeleton-card ${className}`}
      style={{ minHeight: height }}
    >
      <div className="skeleton-card-content">
        {/* Preview skeleton */}
        <div 
          className="skeleton skeleton-preview"
          style={{
            borderRadius: 12,
            minHeight: 140,
            marginBottom: showText ? 16 : 0,
          }}
        />
        
        {showText && (
          <>
            {/* Title skeleton */}
            <div 
              className="skeleton skeleton-title"
              style={{
                height: 20,
                width: "70%",
                marginBottom: 8,
              }}
            />
            
            {/* Description skeleton */}
            <div 
              className="skeleton skeleton-description"
              style={{
                height: 16,
                width: "100%",
                marginBottom: 4,
              }}
            />
            <div 
              className="skeleton skeleton-description"
              style={{
                height: 16,
                width: "85%",
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SkeletonCard;

import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = () => {
  return (
    <div className="skeleton-loader">
      <div className="skeleton-container">
        {/* Sidebar skeleton */}
        <div className="skeleton-sidebar">
          <div className="skeleton-profile">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-name"></div>
            <div className="skeleton-title"></div>
          </div>
          <div className="skeleton-menu">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton-menu-item"></div>
            ))}
          </div>
        </div>
        
        {/* Main content skeleton */}
        <div className="skeleton-main">
          <div className="skeleton-header">
            <div className="skeleton-nav"></div>
          </div>
          <div className="skeleton-content">
            <div className="skeleton-section">
              <div className="skeleton-title-large"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
            </div>
            <div className="skeleton-section">
              <div className="skeleton-title-medium"></div>
              <div className="skeleton-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton-card"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading indicator */}
      <div className="skeleton-loading-indicator">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading theme configuration...</div>
      </div>
    </div>
  );
};

export default SkeletonLoader;

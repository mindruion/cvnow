import React from 'react';
import './CVSkeletonLoader.css';

const CVSkeletonLoader = () => {
  return (
    <div className="cv-skeleton-loader">
      <div className="cv-skeleton-container">
        {/* Header with navigation */}
        <div className="cv-skeleton-header">
          <div className="cv-skeleton-nav">
            <div className="cv-skeleton-logo"></div>
            <div className="cv-skeleton-menu">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="cv-skeleton-menu-item"></div>
              ))}
            </div>
            <div className="cv-skeleton-theme-toggle"></div>
          </div>
        </div>

        {/* Main content area */}
        <div className="cv-skeleton-main">
          {/* Sidebar Profile Card */}
          <div className="cv-skeleton-sidebar">
            <div className="cv-skeleton-profile-card">
              {/* Profile Image */}
              <div className="cv-skeleton-avatar"></div>
              
              {/* Profile Info */}
              <div className="cv-skeleton-profile-info">
                <div className="cv-skeleton-name"></div>
                <div className="cv-skeleton-profession"></div>
                
                {/* Social Links */}
                <div className="cv-skeleton-social-links">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="cv-skeleton-social-btn"></div>
                  ))}
                </div>
                
                {/* Contact Information */}
                <div className="cv-skeleton-contact-info">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="cv-skeleton-contact-item">
                      <div className="cv-skeleton-contact-icon"></div>
                      <div className="cv-skeleton-contact-details">
                        <div className="cv-skeleton-contact-label"></div>
                        <div className="cv-skeleton-contact-value"></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Download Button */}
                <div className="cv-skeleton-download-btn"></div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="cv-skeleton-content">
            {/* Page Title */}
            <div className="cv-skeleton-page-title">
              <div className="cv-skeleton-title"></div>
            </div>

            {/* Resume Sections */}
            <div className="cv-skeleton-resume-sections">
              {/* Education/Experience Cards */}
              <div className="cv-skeleton-resume-grid">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="cv-skeleton-resume-card">
                    <div className="cv-skeleton-resume-header">
                      <div className="cv-skeleton-resume-icon"></div>
                      <div className="cv-skeleton-resume-title"></div>
                    </div>
                    <div className="cv-skeleton-resume-items">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="cv-skeleton-resume-item">
                          <div className="cv-skeleton-resume-date"></div>
                          <div className="cv-skeleton-resume-job-title"></div>
                          <div className="cv-skeleton-resume-company"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills Section */}
              <div className="cv-skeleton-skills-section">
                <div className="cv-skeleton-skills-title"></div>
                <div className="cv-skeleton-skills-grid">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="cv-skeleton-skill-item">
                      <div className="cv-skeleton-skill-name"></div>
                      <div className="cv-skeleton-skill-bar">
                        <div className="cv-skeleton-skill-progress"></div>
                      </div>
                      <div className="cv-skeleton-skill-percentage"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="cv-skeleton-loading-indicator">
        <div className="cv-loading-spinner"></div>
        <div className="cv-loading-text">Loading CV data...</div>
      </div>
    </div>
  );
};

export default CVSkeletonLoader;


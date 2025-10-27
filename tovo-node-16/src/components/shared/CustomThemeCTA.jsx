import React from "react";

const CustomThemeCTA = ({ 
  onClick, 
  disabled = false, 
  variant = "primary",
  className = "",
  analyticsId = "cta_custom_theme"
}) => {
  const handleClick = () => {
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'click', {
        event_category: 'theme',
        event_label: analyticsId,
        value: 1
      });
    }
    
    onClick();
  };

  const baseClasses = "resume-add-btn";
  const variantClasses = variant === "secondary" ? "btn-outline-secondary" : "";
  
  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      data-analytics-id={analyticsId}
    >
      Use Custom Theme
    </button>
  );
};

export default CustomThemeCTA;

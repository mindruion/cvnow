import React from "react";

const Callout = ({ 
  children,
  variant = "info",
  icon,
  className = ""
}) => {
  const getIcon = () => {
    if (icon) return icon;
    
    switch (variant) {
      case "warning":
        return <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>;
      case "error":
        return <i className="fa fa-times-circle" aria-hidden="true"></i>;
      case "success":
        return <i className="fa fa-check-circle" aria-hidden="true"></i>;
      case "info":
      default:
        return <i className="fa fa-info-circle" aria-hidden="true"></i>;
    }
  };

  return (
    <div className={`callout callout-${variant} ${className}`}>
      <div className="callout-content">
        <div className="callout-icon">
          {getIcon()}
        </div>
        <div className="callout-text">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Callout;

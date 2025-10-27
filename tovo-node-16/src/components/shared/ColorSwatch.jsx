import React from "react";

const ColorSwatch = ({ 
  color, 
  label, 
  onClick, 
  disabled = false,
  size = "medium",
  showLabel = false 
}) => {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-10 h-10", 
    large: "w-12 h-12"
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(color);
    }
  };

  const handleKeyDown = (event) => {
    if (disabled) return;
    
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="color-swatch-container">
      <button
        type="button"
        className={`color-swatch ${sizeClasses[size]} ${disabled ? 'disabled' : ''}`}
        style={{ backgroundColor: color }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={`${label} color ${color}`}
        title={`${label} color ${color}`}
      />
      {showLabel && (
        <span className="color-swatch-label text-xs text-muted-foreground mt-1">
          {color}
        </span>
      )}
    </div>
  );
};

export default ColorSwatch;

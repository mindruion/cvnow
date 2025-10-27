import React, { useState } from "react";
import ColorSwatch from "./ColorSwatch";
import CustomColorPopover from "./CustomColorPopover";

const TokenRow = ({ 
  label, 
  colors = [], 
  onColorSelect, 
  surfaceColor = "#ffffff",
  disabled = false 
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleSwatchClick = (color) => {
    if (!disabled && onColorSelect) {
      onColorSelect(color);
    }
  };

  const handleCustomClick = () => {
    if (!disabled) {
      setIsPopoverOpen(true);
    }
  };

  const handleCustomColorSelect = (color) => {
    if (onColorSelect) {
      onColorSelect(color);
    }
    setIsPopoverOpen(false);
  };

  const handlePopoverClose = () => {
    setIsPopoverOpen(false);
  };

  return (
    <div className="token-row">
      <div className="token-row-header">
        <label className="token-label">{label}</label>
        <div className="token-swatches">
          {colors.map((color, index) => (
            <ColorSwatch
              key={`${color}-${index}`}
              color={color}
              label={label}
              onClick={handleSwatchClick}
              disabled={disabled}
              size="medium"
            />
          ))}
          <div className="custom-swatch-container">
            <button
              type="button"
              className="custom-swatch"
              onClick={handleCustomClick}
              disabled={disabled}
              aria-label={`Custom ${label.toLowerCase()} color`}
              title={`Custom ${label.toLowerCase()} color`}
            >
              <span className="custom-swatch-text">Custom…</span>
            </button>
          </div>
        </div>
      </div>
      
      <CustomColorPopover
        isOpen={isPopoverOpen}
        onClose={handlePopoverClose}
        onColorSelect={handleCustomColorSelect}
        currentColor="#000000"
        surfaceColor={surfaceColor}
        label={`Custom ${label}`}
      />
    </div>
  );
};

export default TokenRow;

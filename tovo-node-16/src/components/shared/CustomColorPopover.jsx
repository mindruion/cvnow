import React, { useState, useRef, useEffect } from "react";

const CustomColorPopover = ({ 
  isOpen, 
  onClose, 
  onColorSelect, 
  currentColor = "#000000",
  surfaceColor = "#ffffff",
  label = "Custom Color"
}) => {
  const [hexValue, setHexValue] = useState(currentColor);
  const [isValidHex, setIsValidHex] = useState(true);
  const popoverRef = useRef(null);

  const HEX_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

  useEffect(() => {
    setHexValue(currentColor);
  }, [currentColor]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const validateHex = (value) => {
    return HEX_PATTERN.test(value);
  };

  const getContrastRatio = (color1, color2) => {
    // Convert hex to RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);

    if (!rgb1 || !rgb2) return 0;

    // Calculate relative luminance
    const getLuminance = (r, g, b) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  };

  const getContrastStatus = (color, surface) => {
    const ratio = getContrastRatio(color, surface);
    if (ratio >= 4.5) return { status: 'pass', text: 'Good contrast' };
    if (ratio >= 3) return { status: 'warning', text: 'Acceptable contrast' };
    return { status: 'fail', text: 'Poor contrast' };
  };

  const handleHexChange = (value) => {
    setHexValue(value);
    setIsValidHex(validateHex(value));
  };

  const handleSubmit = () => {
    if (isValidHex && hexValue !== currentColor) {
      onColorSelect(hexValue);
    }
    onClose();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      onClose();
    } else if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  const contrastStatus = getContrastStatus(hexValue, surfaceColor);

  return (
    <div 
      ref={popoverRef}
      className="custom-color-popover"
      onKeyDown={handleKeyDown}
    >
      <div className="popover-header">
        <h4 className="popover-title">{label}</h4>
        <button
          type="button"
          className="popover-close"
          onClick={onClose}
          aria-label="Close color picker"
        >
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>
      </div>
      
      <div className="popover-body">
        <div className="color-preview-section">
          <div 
            className="color-preview"
            style={{ backgroundColor: hexValue }}
          />
          <div className="color-info">
            <div className="color-value">{hexValue}</div>
            <div className={`contrast-badge ${contrastStatus.status}`}>
              <i className={`fa fa-${contrastStatus.status === 'pass' ? 'check' : contrastStatus.status === 'warning' ? 'exclamation-triangle' : 'times'}`}></i>
              {contrastStatus.text}
            </div>
          </div>
        </div>

        <div className="color-input-section">
          <label className="form-label">Hex Color</label>
          <div className="color-input-group">
            <input
              type="text"
              className={`form-control ${!isValidHex ? 'is-invalid' : ''}`}
              value={hexValue}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="#000000"
              maxLength={7}
            />
            <input
              type="color"
              className="form-control form-control-color"
              value={hexValue}
              onChange={(e) => handleHexChange(e.target.value)}
              style={{ width: 48, height: 38 }}
            />
          </div>
          {!isValidHex && (
            <div className="invalid-feedback">Invalid hex color format</div>
          )}
        </div>
      </div>

      <div className="popover-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!isValidHex}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default CustomColorPopover;

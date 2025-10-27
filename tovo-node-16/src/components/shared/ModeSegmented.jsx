import React, { useRef } from "react";
import { t } from "../../utils/translations";

const ModeSegmented = ({ value, onChange, disabled = false }) => {
  const groupRef = useRef(null);
  const lightRef = useRef(null);
  const darkRef = useRef(null);

  const modes = [
    { value: "light", label: t("light"), ref: lightRef },
    { value: "dark", label: t("dark"), ref: darkRef },
  ];

  const handleKeyDown = (event) => {
    if (disabled) return;

    const currentIndex = modes.findIndex(mode => mode.value === value);
    
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : modes.length - 1;
        onChange(modes[prevIndex].value);
        modes[prevIndex].ref.current?.focus();
        break;
        
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        const nextIndex = currentIndex < modes.length - 1 ? currentIndex + 1 : 0;
        onChange(modes[nextIndex].value);
        modes[nextIndex].ref.current?.focus();
        break;
        
      case "Enter":
      case " ":
        event.preventDefault();
        // Toggle between light and dark
        const newMode = value === "light" ? "dark" : "light";
        onChange(newMode);
        break;
        
      default:
        break;
    }
  };

  const handleClick = (modeValue) => {
    if (!disabled) {
      onChange(modeValue);
    }
  };

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Theme mode selection"
      className="mode-segmented"
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
    >
      {modes.map((mode) => (
        <button
          key={mode.value}
          ref={mode.ref}
          type="button"
          role="radio"
          aria-checked={value === mode.value}
          aria-label={`${mode.label} mode`}
          className={`mode-segmented-option ${
            value === mode.value ? "active" : ""
          } ${disabled ? "disabled" : ""}`}
          onClick={() => handleClick(mode.value)}
          disabled={disabled}
          tabIndex={-1} // Parent handles tabbing
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
};

export default ModeSegmented;

import React, { useState, useEffect } from "react";

const Accordion = ({ 
  id, 
  children, 
  defaultCollapsed = true, 
  onToggle,
  className = "",
  header,
  disabled = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);

  useEffect(() => {
    setIsExpanded(!defaultCollapsed);
  }, [defaultCollapsed]);

  const handleToggle = () => {
    if (disabled) return;
    
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    if (onToggle) {
      onToggle(newExpanded);
    }
  };

  const handleKeyDown = (event) => {
    if (disabled) return;
    
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`accordion ${className}`}>
      <div className="accordion-header">
        <button
          type="button"
          className="accordion-trigger"
          aria-expanded={isExpanded}
          aria-controls={`${id}-content`}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          id={`${id}-trigger`}
        >
          {header}
          <i 
            className={`fa fa-chevron-${isExpanded ? 'up' : 'down'} accordion-icon`}
            aria-hidden="true"
          />
        </button>
      </div>
      
      <div
        id={`${id}-content`}
        className={`accordion-content ${isExpanded ? 'expanded' : 'collapsed'} ${disabled ? 'disabled' : ''}`}
        aria-labelledby={`${id}-trigger`}
        role="region"
      >
        <div className="accordion-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion;

import React from 'react';

const EntryCard = ({
  title,
  subtitle,
  isOpen,
  onToggle,
  onDelete,
  onDuplicate,
  children,
  className = '',
  bodyId,
  ariaLabel,
  disabled = false,
  showDelete = true,
  showDuplicate = true,
  onHeaderKeyDown,
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
    // Call custom keydown handler if provided
    if (onHeaderKeyDown) {
      onHeaderKeyDown(e);
    }
  };

  return (
    <div className={`exp-card card inner-card mb-4 ${className}`}>
      <div 
        className="exp-card__head"
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={bodyId}
        aria-label={ariaLabel}
      >
        <div className="exp-card__title">
          {title}
          {subtitle && (
            <>
              <span className="separator">—</span>
              <span>{subtitle}</span>
            </>
          )}
        </div>
        <div className="exp-card__actions d-flex align-items-center gap-2">
          <div className="exp-card__toggle-icon">
            <i className={`fa fa-chevron-${isOpen ? 'up' : 'down'}`} aria-hidden="true"></i>
          </div>
          {showDuplicate && onDuplicate && (
            <button
              type="button"
              className="icon-btn duplicate-entry"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              disabled={disabled}
              aria-label="Duplicate entry"
              data-tooltip="Duplicate entry"
            >
              <i className="fa fa-copy" aria-hidden="true"></i>
            </button>
          )}
          {showDelete && onDelete && (
            <button
              type="button"
              className="icon-btn delete-exp"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={disabled}
              aria-label="Remove entry"
              data-tooltip="Remove entry"
            >
              <i className="fa fa-trash" aria-hidden="true"></i>
            </button>
          )}
        </div>
      </div>
      <div 
        id={bodyId}
        className="exp-card__body"
        aria-hidden={!isOpen}
        ref={(el) => {
          if (!el) return;
          const inner = el.firstChild;
          if (!inner) return;
          // animate height
          const target = isOpen ? inner.scrollHeight : 0;
          el.style.height = target + 'px';
        }}
      >
        <div className="exp-card__body-inner">
          {children}
        </div>
      </div>
    </div>
  );
};

export default EntryCard;

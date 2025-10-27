import React from "react";

const InlineError = ({ 
  message = "Something went wrong",
  onRetry,
  retryLabel = "Try again",
  className = ""
}) => {
  return (
    <div className={`inline-error ${className}`}>
      <div className="inline-error-content">
        <div className="inline-error-icon">
          <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>
        </div>
        
        <div className="inline-error-text">
          <h4 className="inline-error-title">Error loading themes</h4>
          <p className="inline-error-message">{message}</p>
        </div>
        
        {onRetry && (
          <div className="inline-error-actions">
            <button
              type="button"
              className="inline-error-retry"
              onClick={onRetry}
            >
              <i className="fa fa-refresh" aria-hidden="true"></i>
              {retryLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InlineError;

import React, { useEffect, useState, useCallback } from "react";

const DirtySaveBar = ({ 
  isDirty, 
  onSave, 
  onReset, 
  submitting = false,
  saveLabel = "Save",
  resetLabel = "Reset"
}) => {
  const [showToast, setShowToast] = useState(false);

  const showSuccessToast = useCallback(() => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await onSave();
      showSuccessToast();
    } catch (error) {
      console.error('Save failed:', error);
    }
  }, [onSave, showSuccessToast]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check for Cmd+S (Mac) or Ctrl+S (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        if (isDirty && !submitting) {
          handleSave();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, submitting, handleSave]);

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  if (!isDirty) return null;

  return (
    <>
      <div className="dirty-save-bar">
        <div className="dirty-save-bar-content">
          <div className="dirty-save-bar-text">
            <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>
            <span>You have unsaved changes</span>
          </div>
          
          <div className="dirty-save-bar-actions">
            <button
              type="button"
              className="dirty-save-bar-reset"
              onClick={handleReset}
              disabled={submitting}
            >
              {resetLabel}
            </button>
            
            <button
              type="button"
              className="dirty-save-bar-save"
              onClick={handleSave}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <i className="fa fa-spinner fa-pulse" aria-hidden="true"></i>
                  Saving…
                </>
              ) : (
                <>
                  <i className="fa fa-save" aria-hidden="true"></i>
                  {saveLabel}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="success-toast visible">
          <div className="success-toast-content">
            <i className="fa fa-check-circle" aria-hidden="true"></i>
            <span>Changes saved successfully</span>
          </div>
        </div>
      )}
    </>
  );
};

export default DirtySaveBar;

import React from 'react';

const PreviewButton = ({ 
  subdomain, 
  disabled = false, 
  className = "resume-preview-btn",
  children = "Preview",
  icon = "fa-external-link-alt"
}) => {
  const handlePreview = () => {
    if (subdomain) {
      const url = `https://${subdomain}.cvnow.me`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handlePreview}
      disabled={disabled || !subdomain}
      title={`Preview resume at https://${subdomain}.cvnow.me`}
    >
      <i className={`fa ${icon} me-2`} aria-hidden="true"></i>
      {children}
    </button>
  );
};

export default PreviewButton;

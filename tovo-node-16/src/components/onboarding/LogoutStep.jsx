import React from "react";
import PreviewButton from "../shared/PreviewButton";
import { useAuth } from "../../context/AuthContext";

const LogoutStep = ({ defaultValues, onNext, submitting, onChange, nextLabel }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="logout-step-container">
      <div className="text-center">
        <div className="logout-icon mb-4">
          <i className="fa fa-sign-out fa-3x text-muted" aria-hidden="true"></i>
        </div>
        
        <h3 className="mb-3">Ready to Logout?</h3>
        
        <p className="text-muted mb-4">
          You've completed your resume setup. You can logout now or continue editing later.
        </p>
        
        <div className="logout-actions">
          <div className="d-flex gap-3 justify-content-center">
            <PreviewButton 
              subdomain={defaultValues?.subdomain}
              disabled={submitting}
            />
            <button
              type="button"
              className="resume-save-btn"
              onClick={handleLogout}
              disabled={submitting}
            >
              <i className="fa fa-sign-out me-2" aria-hidden="true"></i>
              Logout
            </button>
            
            <button
              type="button"
              className="resume-add-btn"
              onClick={() => onNext && onNext()}
              disabled={submitting}
            >
              <i className="fa fa-arrow-left me-2" aria-hidden="true"></i>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutStep;

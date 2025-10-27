import React, { useEffect, useMemo, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ResendVerificationForm from "../components/ResendVerificationForm";

const VerifyEmailPage = () => {
  const location = useLocation();
  const history = useHistory();
  const { signInWithTokens } = useAuth();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [status, setStatus] = useState(
    uid && token ? "loading" : "missing-params"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    if (!uid || !token) {
      return;
    }

    let isActive = true;

    const verifyEmail = async () => {
      try {
        const { data } = await api.get("/api/auth/verify-email", {
          params: { uid, token },
        });
        const access = data?.access || "";
        if (!access) {
          throw new Error("Access token not provided by the server.");
        }
        const result = signInWithTokens({
          access,
          refresh: data?.refresh || "",
        });
        if (!result.success) {
          throw new Error(result.message || "Unable to sign in with tokens.");
        }
        toast.success("Email confirmed");
        history.replace("/my-resume");
      } catch (error) {
        if (!isActive) {
          return;
        }
        const detail =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Invalid or expired verification link.";
        setErrorMessage(detail);
        setStatus("error");
      }
    };

    verifyEmail();

    return () => {
      isActive = false;
    };
  }, [uid, token, signInWithTokens, history]);

  const renderContent = () => {
    if (status === "loading") {
      return (
        <div className="text-center">
          <i
            className="fa fa-spinner fa-pulse fa-3x resume-spinner mb-3"
            aria-hidden="true"
          ></i>
          <h3 className="mb-2">Verifying email…</h3>
          <p>We&apos;re confirming your account. This won&apos;t take long.</p>
        </div>
      );
    }

    if (status === "missing-params") {
      return (
        <div className="text-center">
          <h3 className="mb-3">Link expired or invalid</h3>
          <p className="mb-4">
            The verification link appears to be incomplete. Please request a new
            one.
          </p>
          <button
            type="button"
            className="resume-save-btn"
            onClick={() => setShowResend(true)}
          >
            Resend verification email
          </button>
          {showResend ? (
            <div className="mt-4 text-start">
              <ResendVerificationForm onSent={() => setShowResend(false)} />
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div>
        <div className="error-message text-center mb-3">{errorMessage}</div>
        <div className="text-center">
          <p className="mb-3">
            Your verification link may have expired. You can request a new
            verification email below.
          </p>
          <button
            type="button"
            className="resume-save-btn"
            onClick={() => setShowResend((prev) => !prev)}
          >
            {showResend ? "Hide resend form" : "Resend verification email"}
          </button>
          {showResend ? (
            <div className="mt-4 text-start">
              <ResendVerificationForm onSent={() => setShowResend(false)} />
            </div>
          ) : null}
          <div className="mt-4">
            <Link to="/auth/signin" className="theme-link">
              Return to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      className="authentication-form"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/assets/images/aut-bg.jpg)`,
      }}
    >
      <div className="innerpage-decor">
        <div className="innerpage-circle1">
          <img
            src={`${process.env.PUBLIC_URL}/assets/images/Testimonial2.png`}
            alt=""
          />
        </div>
        <div className="innerpage-circle2">
          <img
            src={`${process.env.PUBLIC_URL}/assets/images/Testimonial1.png`}
            alt=""
          />
        </div>
      </div>
      <div>
        <h2 className="title text-center">
          <span> Verify email</span>
        </h2>
        <p className="text-center">
          We&apos;re confirming your email address to activate your account.
        </p>
        <div className="resume-card">{renderContent()}</div>
      </div>
    </section>
  );
};

export default VerifyEmailPage;

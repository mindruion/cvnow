import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useHistory, useLocation } from "react-router-dom";
import PasswordChecklist from "react-password-checklist";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const schema = yup.object({
  new_password: yup
    .string()
    .min(8, "Password must be at least 8 characters.")
    .required("New password is required."),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("new_password")], "Passwords do not match.")
    .required("Please confirm your password."),
});

const ResetPasswordPage = () => {
  const location = useLocation();
  const history = useHistory();
  const { signInWithTokens } = useAuth();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [serverError, setServerError] = useState("");

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      new_password: "",
      confirmPassword: "",
    },
  });

  const newPasswordValue = watch("new_password", "");
  const confirmPasswordValue = watch("confirmPassword", "");

  const onSubmit = async ({ confirmPassword, new_password }) => {
    if (!uid || !token) {
      setServerError("This password reset link is invalid or has expired.");
      return;
    }
    setServerError("");
    try {
      const { data } = await api.post("/api/auth/password-reset-confirm", {
        uid,
        token,
        new_password,
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
      toast.success("Password updated. You're now signed in.");
      history.replace("/my-resume");
    } catch (error) {
      const detail =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Invalid or expired link.";
      if (detail.toLowerCase().includes("password")) {
        setError("new_password", { type: "server", message: detail });
      } else {
        setServerError(detail);
      }
      toast.error(detail);
    }
  };

  const missingParams = !uid || !token;

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
          <span> Reset password</span>
        </h2>
        <p className="text-center">
          Choose a new password to finish resetting your account.
        </p>
        <div className="resume-card">
          {missingParams ? (
            <div className="text-center">
              <div className="error-message mb-3">
                This reset link is incomplete or has already been used.
              </div>
              <p className="mb-4">
                Request a new password reset link to continue.
              </p>
              <Link to="/auth/forgot-password" className="resume-save-btn">
                Request another reset
              </Link>
            </div>
          ) : (
            <>
              {serverError ? (
                <div className="error-message text-center mb-3">
                  {serverError}
                </div>
              ) : null}
              <form
                className="theme-form resume-form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                <div className="form-group position-relative">
                  <label
                    htmlFor="reset-new-password"
                    className="form-label d-block text-start"
                  >
                    New password
                  </label>
                  <input
                    id="reset-new-password"
                    type="password"
                    className={`form-control ${
                      errors.new_password ? "is-invalid" : ""
                    }`}
                    placeholder="New password"
                    autoComplete="new-password"
                    {...register("new_password")}
                  />
                  {errors.new_password ? (
                    <div className="invalid-feedback d-block">
                      {errors.new_password.message}
                    </div>
                  ) : null}
                </div>
                <div className="form-group position-relative">
                  <label
                    htmlFor="reset-confirm-password"
                    className="form-label d-block text-start"
                  >
                    Confirm password
                  </label>
                  <input
                    id="reset-confirm-password"
                    type="password"
                    className={`form-control ${
                      errors.confirmPassword ? "is-invalid" : ""
                    }`}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword ? (
                    <div className="invalid-feedback d-block">
                      {errors.confirmPassword.message}
                    </div>
                  ) : null}
                </div>
                <PasswordChecklist
                  rules={[
                    "minLength",
                    "specialChar",
                    "number",
                    "capital",
                    "match",
                  ]}
                  minLength={8}
                  value={newPasswordValue}
                  valueAgain={confirmPasswordValue}
                  className="mb-3 text-start"
                />
                <div className="text-center">
                  <button
                    type="submit"
                    className="resume-save-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <i
                          className="fa fa-spinner fa-pulse me-2"
                          aria-hidden="true"
                        ></i>
                        Updating password…
                      </>
                    ) : (
                      "Update password"
                    )}
                  </button>
                </div>
              </form>
              <div className="text-center mt-3">
                <Link to="/auth/forgot-password" className="theme-link">
                  Need a new link?
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ResetPasswordPage;

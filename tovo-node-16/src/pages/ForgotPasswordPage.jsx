import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

const schema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address.")
    .required("Email is required."),
});

const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const { data } = await api.post("/api/auth/password-reset", values);
      toast.success(
        data?.detail ||
          "If an account exists, a reset link was sent to your email."
      );
      setSubmitted(true);
    } catch (error) {
      const detail =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Unable to process your request.";
      if (detail.toLowerCase().includes("email")) {
        setError("email", { type: "server", message: detail });
      } else {
        setServerError(detail);
      }
      toast.error(detail);
    }
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
          <span> Forgot password</span>
        </h2>
        <p className="text-center">
          Enter your email and we&apos;ll send you a reset link.
        </p>
        <div className="resume-card">
          {submitted ? (
            <div className="text-center">
              <i
                className="fa fa-envelope-open fa-3x mb-3"
                aria-hidden="true"
                style={{ color: "var(--resume-primary)" }}
              ></i>
              <h3 className="mb-3">Check your email</h3>
              <p className="mb-4">
                If an account exists, we sent a reset link. Please follow the
                instructions in the email to set a new password.
              </p>
              <Link to="/auth/signin" className="resume-save-btn">
                Return to sign in
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
                <div className="form-group">
                  <label
                    htmlFor="forgot-password-email"
                    className="form-label d-block text-start"
                  >
                    Email address
                  </label>
                  <input
                    id="forgot-password-email"
                    type="email"
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    placeholder="Email address"
                    autoComplete="email"
                    {...register("email")}
                  />
                  {errors.email ? (
                    <div className="invalid-feedback d-block">
                      {errors.email.message}
                    </div>
                  ) : null}
                </div>
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
                        Sending reset link…
                      </>
                    ) : (
                      "Send reset link"
                    )}
                  </button>
                </div>
              </form>
              <div className="text-center mt-3">
                <Link to="/auth/signin" className="theme-link">
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ForgotPasswordPage;

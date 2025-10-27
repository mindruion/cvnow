import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import PasswordChecklist from "react-password-checklist";
import { useHistory, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import ResendVerificationForm from "../components/ResendVerificationForm";

const signupSchema = yup.object({
  first_name: yup.string().required("First name is required."),
  last_name: yup.string().required("Last name is required."),
  email: yup
    .string()
    .email("Please enter a valid email.")
    .required("Email is required."),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters.")
    .required("Password is required."),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match.")
    .required("Please confirm your password."),
});

const SignupPage = () => {
  const { signup, authLoading, isAuthenticated } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/my-resume";

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [serverError, setServerError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const {
    handleSubmit,
    register,
    watch,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password", "");
  const confirmValue = watch("confirmPassword", "");

  useEffect(() => {
    if (isAuthenticated) {
      history.replace(from);
    }
  }, [isAuthenticated, history, from]);

  const onSubmit = async ({ confirmPassword, ...values }) => {
    setServerError("");
    const result = await signup(values);
    if (result.success) {
      setSignupSuccess(true);
      toast.success(
        result.data?.detail ||
          "Registration successful. Check your email to confirm your account."
      );
    } else {
      if (result.data && typeof result.data === "object") {
        Object.entries(result.data).forEach(([field, message]) => {
          if (typeof message === "string" || Array.isArray(message)) {
            const messageText = Array.isArray(message)
              ? message.join(" ")
              : message;
            if (["first_name", "last_name", "email", "password"].includes(field)) {
              setError(field, { type: "server", message: messageText });
            }
          }
        });
      }
      const message = result.message || "Unable to sign up.";
      setServerError(message);
      toast.error(message);
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
          <span> Sign up</span>
        </h2>
        <div className="resume-card">
          {signupSuccess ? (
            <div className="text-center">
              <div className="mb-4">
                <i
                  className="fa fa-check-circle fa-3x mb-3"
                  aria-hidden="true"
                  style={{ color: "var(--resume-primary)" }}
                ></i>
                <h3 className="mb-3">Almost there!</h3>
                <p className="mb-2">
                  We&apos;ve sent a confirmation email. Please verify your email
                  to continue.
                </p>
                <p className="mb-4">
                  Once confirmed, we&apos;ll sign you in automatically.
                </p>
              </div>
              <div className="mb-3">
                <Link to="/auth/signin" className="resume-save-btn">
                  Go to sign in
                </Link>
              </div>
              <button
                type="button"
                className="resume-add-btn"
                onClick={() => setShowResend((prev) => !prev)}
              >
                Didn&apos;t get it?
              </button>
              {showResend ? (
                <div className="mt-4 text-start">
                  <ResendVerificationForm
                    defaultEmail={watch("email")}
                    onSent={() => setShowResend(false)}
                    onCancel={() => setShowResend(false)}
                  />
                </div>
              ) : null}
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
                    htmlFor="signup-first-name"
                    className="form-label d-block text-start"
                  >
                    First name
                  </label>
                  <input
                    id="signup-first-name"
                    type="text"
                    className={`form-control ${
                      errors.first_name ? "is-invalid" : ""
                    }`}
                    placeholder="First name"
                    autoComplete="given-name"
                    {...register("first_name")}
                  />
                  {errors.first_name ? (
                    <div className="invalid-feedback d-block">
                      {errors.first_name.message}
                    </div>
                  ) : null}
                </div>
                <div className="form-group">
                  <label
                    htmlFor="signup-last-name"
                    className="form-label d-block text-start"
                  >
                    Last name
                  </label>
                  <input
                    id="signup-last-name"
                    type="text"
                    className={`form-control ${
                      errors.last_name ? "is-invalid" : ""
                    }`}
                    placeholder="Last name"
                    autoComplete="family-name"
                    {...register("last_name")}
                  />
                  {errors.last_name ? (
                    <div className="invalid-feedback d-block">
                      {errors.last_name.message}
                    </div>
                  ) : null}
                </div>
                <div className="form-group">
                  <label
                    htmlFor="signup-email"
                    className="form-label d-block text-start"
                  >
                    Email address
                  </label>
                  <input
                    id="signup-email"
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
                <div className="form-group position-relative">
                  <label
                    htmlFor="signup-password"
                    className="form-label d-block text-start"
                  >
                    Password
                  </label>
                  <input
                    id="signup-password"
                    type={showPwd ? "text" : "password"}
                    className={`form-control ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    placeholder="Password"
                    autoComplete="new-password"
                    {...register("password")}
                  />
                  <div
                    className="show-hide"
                    onClick={() => setShowPwd((prev) => !prev)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={() => setShowPwd((prev) => !prev)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                  >
                    <span className={!showPwd ? "show" : ""}></span>
                  </div>
                  {errors.password ? (
                    <div className="invalid-feedback d-block">
                      {errors.password.message}
                    </div>
                  ) : null}
                </div>
                <div className="form-group position-relative">
                  <label
                    htmlFor="signup-confirm-password"
                    className="form-label d-block text-start"
                  >
                    Confirm password
                  </label>
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPwd ? "text" : "password"}
                    className={`form-control ${
                      errors.confirmPassword ? "is-invalid" : ""
                    }`}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                  />
                  <div
                    className="show-hide"
                    onClick={() => setShowConfirmPwd((prev) => !prev)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={() => setShowConfirmPwd((prev) => !prev)}
                    aria-label={
                      showConfirmPwd ? "Hide password" : "Show password"
                    }
                  >
                    <span className={!showConfirmPwd ? "show" : ""}></span>
                  </div>
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
                  value={passwordValue}
                  valueAgain={confirmValue}
                  className="mb-3 text-start"
                />

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      className="custom-control-input"
                      id="termsAccepted"
                    />
                    <label
                      className="custom-control-label"
                      htmlFor="termsAccepted"
                    >
                      I agree to terms
                    </label>
                  </div>
                  <Link to="/auth/signin" className="theme-link">
                    Already have an account?
                  </Link>
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="resume-save-btn"
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <>
                        <i
                          className="fa fa-spinner fa-pulse me-2"
                          aria-hidden="true"
                        ></i>
                        Creating account…
                      </>
                    ) : (
                      "Sign up"
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default SignupPage;

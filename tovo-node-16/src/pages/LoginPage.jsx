import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useHistory, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const loginSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address.")
    .required("Email is required."),
  password: yup.string().required("Password is required."),
});

const LoginPage = () => {
  const { login, authLoading, isAuthenticated } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const from =
    location.state?.from?.pathname ||
    (typeof location.state?.from === "string"
      ? location.state.from
      : "/");

  const [showPwd, setShowPwd] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      history.replace(from);
    }
  }, [isAuthenticated, history, from]);

  const onSubmit = async (values) => {
    setServerError("");
    const result = await login(values);
    if (result.success) {
      toast.success("Welcome back!");
      history.replace(from);
    } else {
      const message = result.message || "Unable to log in.";
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
          <span> Sign in</span>
        </h2>
        <p className="text-center">
          Please sign in with your account information.
        </p>
        <div className="resume-card">
          <p className="text-center mb-4">
            Enter your email and password to access your account.
          </p>
          {serverError ? (
            <div className="error-message text-center mb-3">{serverError}</div>
          ) : null}

          <form
            className="theme-form resume-form w-100"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="form-group">
              <label htmlFor="login-email" className="form-label d-block text-start">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
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
                htmlFor="login-password"
                className="form-label d-block text-start"
              >
                Password
              </label>
              <input
                id="login-password"
                type={showPwd ? "text" : "password"}
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
                placeholder="Password"
                autoComplete="current-password"
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
              <div className="text-end mt-2">
                <Link to="/auth/forgot-password" className="theme-link">
                  Forgot password?
                </Link>
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="rememberMe"
                />
                <label className="custom-control-label" htmlFor="rememberMe">
                  Remember me
                </label>
              </div>
              <Link to="/auth/signup" className="theme-link">
                Need an account?
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
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;

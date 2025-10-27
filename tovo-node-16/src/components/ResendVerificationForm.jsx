import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import api from "../api/axios";

const schema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid email address.")
    .required("Email is required."),
});

const ResendVerificationForm = ({
  defaultEmail = "",
  onSent,
  onCancel,
  submitLabel = "Resend verification email",
}) => {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: defaultEmail },
  });

  useEffect(() => {
    reset({ email: defaultEmail });
  }, [defaultEmail, reset]);

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post(
        "/api/auth/resend-verification",
        values
      );
      toast.success(
        data?.detail ||
          "If an account exists, a verification email was sent."
      );
      if (onSent) {
        onSent();
      }
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Unable to send verification email.";
      if (message.toLowerCase().includes("email")) {
        setError("email", { type: "server", message });
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <form className="resume-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label htmlFor="resend-email" className="form-label d-block text-start">
          Email address
        </label>
        <input
          id="resend-email"
          type="email"
          className={`form-control ${errors.email ? "is-invalid" : ""}`}
          placeholder="Email address"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email ? (
          <div className="invalid-feedback d-block">{errors.email.message}</div>
        ) : null}
      </div>
      <div className="form-group mb-0">
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
              Sending…
            </>
          ) : (
            submitLabel
          )}
        </button>
        {onCancel ? (
          <button
            type="button"
            className="resume-add-btn"
            onClick={onCancel}
            disabled={isSubmitting}
            style={{ marginLeft: "1rem" }}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
};

export default ResendVerificationForm;

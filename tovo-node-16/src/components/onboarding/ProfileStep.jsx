import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import PreviewButton from "../shared/PreviewButton";
import { applyServerErrors } from "./stepUtils";

const profileSchema = yup.object({
  profession: yup.string().required("Profession is required."),
  phone: yup.string().required("Phone number is required."),
  email: yup
    .string()
    .email("Please enter a valid email address.")
    .required("Email is required."),
  location: yup.string().required("Location is required."),
  language_used: yup.string().required("Primary language is required."),
  facebook: yup.string().nullable(),
  linkedin: yup.string().nullable(),
  about: yup.object({
    short_description: yup
      .string()
      .required("Headline is required."),
    description: yup
      .string()
      .required("Short bio is required."),
  }),
  include_blogs: yup.boolean(),
  can_download_cv: yup.boolean(),
});

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

const ProfileStep = ({
  defaultValues,
  onNext,
  submitting,
  onChange,
  nextLabel = "Save",
}) => {
  const [serverError, setServerError] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    defaultValues?.avatar || ""
  );

  const memoDefaults = useMemo(() => defaultValues, [defaultValues]);

  const isResettingRef = useRef(false);

  const {
    handleSubmit,
    control,
    register,
    reset,
    watch,
    getValues,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: memoDefaults,
    mode: "onBlur",
  });

  const lastDefaultsRef = useRef("");

  useEffect(() => {
    if (!memoDefaults) {
      return undefined;
    }
    let timerId;
    const snapshot = JSON.stringify(memoDefaults);
    if (snapshot !== lastDefaultsRef.current) {
      const currentSnapshot = JSON.stringify(getValues());
      if (currentSnapshot !== snapshot) {
        isResettingRef.current = true;
        reset(memoDefaults);
        timerId = setTimeout(() => {
          isResettingRef.current = false;
        }, 0);
      } else {
        isResettingRef.current = false;
      }
      lastDefaultsRef.current = snapshot;
    }
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [memoDefaults, reset, getValues]);

  useEffect(() => {
    const subscription = watch((value) => {
      if (isResettingRef.current) {
        return;
      }
      if (onChange) {
        onChange(value);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  const handleServerResponse = (result) => {
    if (result.success) {
      setServerError("");
      return true;
    }
    if (result.fieldErrors) {
      applyServerErrors(setError, result.fieldErrors);
    }
    if (result.message) {
      setServerError(result.message);
    }
    return false;
  };

  const submitForm = async (values) => {
    if (avatarFile) {
      try {
        const base64 = await fileToBase64(avatarFile);
        values.avatar_upload = base64;
      } catch (e) {
        values.avatar_upload = null;
      }
    }
    const result = await onNext(values);
    handleServerResponse(result);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <form
      className="theme-form resume-form w-100"
      onSubmit={handleSubmit(submitForm)}
      noValidate
    >
      <input type="hidden" {...register("avatar")} />
      {serverError ? (
        <div className="error-message text-center mb-3">{serverError}</div>
      ) : null}

      {/* Mobile-first layout: Upload section appears first on mobile */}
      <div className="resume-layout">
        <aside className="resume-profile-card order-md-2">
          <div
            className="avatar-preview"
            style={avatarPreview ? { backgroundImage: `url(${avatarPreview})` } : undefined}
          >
            {!avatarPreview ? <span className="placeholder">Upload avatar</span> : null}
          </div>
          <div className="avatar-actions">
            <label className="avatar-upload-btn">
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
              <i className="fa fa-camera" aria-hidden="true"></i>
              Upload new photo
            </label>
            <button
              type="button"
              className="avatar-reset-btn"
              onClick={() => {
                setAvatarFile(null);
                setAvatarPreview(defaultValues?.avatar || "");
              }}
              disabled={!avatarFile && !defaultValues?.avatar}
            >
              <i className="fa fa-undo" aria-hidden="true"></i>
              Reset to original
            </button>
          </div>
        </aside>

        <div className="resume-primary-card order-md-1">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label" htmlFor="profile-profession">
                  Profession
                </label>
                <input
                  id="profile-profession"
                  type="text"
                  className={`form-control ${
                    errors.profession ? "is-invalid" : ""
                  }`}
                  placeholder="Full Stack Developer"
                  {...register("profession")}
                />
                {errors.profession ? (
                  <div className="invalid-feedback d-block">
                    {errors.profession.message}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label" htmlFor="profile-phone">
                  Phone number
                </label>
                <input
                  id="profile-phone"
                  type="text"
                  className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                  placeholder="+123 456 7890"
                  {...register("phone")}
                />
                {errors.phone ? (
                  <div className="invalid-feedback d-block">
                    {errors.phone.message}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label" htmlFor="profile-email">
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  placeholder="me@example.com"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email ? (
                  <div className="invalid-feedback d-block">
                    {errors.email.message}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label" htmlFor="profile-location">
                  Location
                </label>
                <input
                  id="profile-location"
                  type="text"
                  className={`form-control ${
                    errors.location ? "is-invalid" : ""
                  }`}
                  placeholder="Berlin, Germany"
                  {...register("location")}
                />
                {errors.location ? (
                  <div className="invalid-feedback d-block">
                    {errors.location.message}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* duplicate primary fields removed */}

      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label" htmlFor="profile-facebook">
              Facebook
            </label>
            <input
              id="profile-facebook"
              type="url"
              className={`form-control ${
                errors.facebook ? "is-invalid" : ""
              }`}
              placeholder="https://facebook.com/username"
              {...register("facebook")}
            />
            {errors.facebook ? (
              <div className="invalid-feedback d-block">
                {errors.facebook.message}
              </div>
            ) : null}
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label" htmlFor="profile-linkedin">
              LinkedIn
            </label>
            <input
              id="profile-linkedin"
              type="url"
              className={`form-control ${
                errors.linkedin ? "is-invalid" : ""
              }`}
              placeholder="https://linkedin.com/in/username"
              {...register("linkedin")}
            />
            {errors.linkedin ? (
              <div className="invalid-feedback d-block">
                {errors.linkedin.message}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label" htmlFor="profile-language">
              Primary language
            </label>
            <input
              id="profile-language"
              type="text"
              className={`form-control ${
                errors.language_used ? "is-invalid" : ""
              }`}
              placeholder="en"
              {...register("language_used")}
            />
            {errors.language_used ? (
              <div className="invalid-feedback d-block">
                {errors.language_used.message}
              </div>
            ) : null}
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="form-label" htmlFor="profile-headline">
              Headline
            </label>
            <input
              id="profile-headline"
              type="text"
              className={`form-control ${
                errors?.about?.short_description ? "is-invalid" : ""
              }`}
              placeholder="Product designer & strategist"
              {...register("about.short_description")}
            />
            {errors?.about?.short_description ? (
              <div className="invalid-feedback d-block">
                {errors.about.short_description.message}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="profile-bio">
          Short bio
        </label>
        <textarea
          id="profile-bio"
          className={`form-control ${
            errors?.about?.description ? "is-invalid" : ""
          }`}
          rows={4}
          placeholder="Write a short introduction..."
          {...register("about.description")}
        />
        {errors?.about?.description ? (
          <div className="invalid-feedback d-block">
            {errors.about.description.message}
          </div>
        ) : null}
      </div>

      <div className="resume-toggle-group my-4">
        <Controller
          control={control}
          name="include_blogs"
          render={({ field }) => (
            <label className="resume-toggle">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
              />
              <span className="slider" />
              <span className="label-text">
                Display blog posts on my profile site
              </span>
            </label>
          )}
        />
        <Controller
          control={control}
          name="can_download_cv"
          render={({ field }) => (
            <label className="resume-toggle">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
              />
              <span className="slider" />
              <span className="label-text">
                Allow visitors to download my CV
              </span>
            </label>
          )}
        />
      </div>

      <div className="text-center text-md-end mt-4">
        <div className="d-flex gap-3 justify-content-center justify-content-md-end">
          <PreviewButton 
            subdomain={defaultValues?.subdomain}
            disabled={submitting}
          />
          <button
            type="submit"
            className="resume-save-btn"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <i className="fa fa-spinner fa-pulse me-2" aria-hidden="true"></i>
                Saving…
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProfileStep;

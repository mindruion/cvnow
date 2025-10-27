import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  applyServerErrors,
  sanitizeArrayInput,
  toMonthInputValue,
} from "./stepUtils";
import PreviewButton from "../shared/PreviewButton";
import Switch from "../shared/Switch";

// Helper function to format date range
const formatDateRange = (startDate, endDate, isCurrent) => {
  if (!startDate) return "Date range";
  
  const formatMonthYear = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "-01");
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short" 
    });
  };
  
  const start = formatMonthYear(startDate);
  
  if (isCurrent) {
    return `${start} – Present`;
  }
  
  const end = formatMonthYear(endDate);
  return end ? `${start} – ${end}` : start;
};

const experienceItemSchema = yup.object({
  company: yup.string().required("Company is required."),
  role: yup.string().required("Role is required."),
  location: yup.string().nullable(),
  start_date: yup.string().required("Start date is required."),
  end_date: yup.string().nullable(),
  current: yup.boolean().default(false),
  description: yup.string().nullable(),
});

const serviceItemSchema = yup.object({
  title: yup.string().required("Service name is required."),
  description: yup.string().required("Service description is required."),
});

const experienceSchema = yup.object({
  experience: yup
    .array()
    .of(experienceItemSchema)
    .min(1, "Add at least one experience entry."),
  what_i_do: yup.array().of(serviceItemSchema),
});

const createExperience = () => ({
  company: "",
  role: "",
  location: "",
  start_date: "",
  end_date: "",
  current: false,
  description: "",
});

const createService = () => ({
  title: "",
  description: "",
});

const ExperienceStep = ({
  defaultValues,
  onNext,
  submitting,
  onChange,
  nextLabel = "Save",
}) => {
  const [serverError, setServerError] = useState("");
  const [expandedCards, setExpandedCards] = useState(new Set([0])); // First card expanded by default
  const [fieldErrors, setFieldErrors] = useState({});

  const sanitizedDefaults = useMemo(
    () => ({
      experience: sanitizeArrayInput(
        defaultValues.experience,
        createExperience
      ).map((item) => ({
        ...item,
        location: item.location || "",
        current: Boolean(item.current),
        start_date: toMonthInputValue(item.start_date),
        end_date: toMonthInputValue(item.end_date),
      })),
      what_i_do: sanitizeArrayInput(defaultValues.what_i_do, createService),
    }),
    [defaultValues]
  );

  const isResettingRef = useRef(false);

  const {
    handleSubmit,
    control,
    register,
    reset,
    watch,
    getValues,
    setError,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(experienceSchema),
    defaultValues: sanitizedDefaults,
    mode: "onBlur",
  });

  const lastDefaultsRef = useRef("");

  useEffect(() => {
    let timerId;
    const snapshot = JSON.stringify(sanitizedDefaults);
    if (snapshot !== lastDefaultsRef.current) {
      const currentSnapshot = JSON.stringify(getValues());
      if (currentSnapshot !== snapshot) {
        isResettingRef.current = true;
        reset(sanitizedDefaults);
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
  }, [sanitizedDefaults, reset, getValues]);

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

  const {
    fields: experienceFields,
    append: addExperience,
    remove: removeExperience,
  } = useFieldArray({
    control,
    name: "experience",
  });

  // Clean up expanded state when experience items are removed
  useEffect(() => {
    setExpandedCards(prev => {
      const newSet = new Set();
      prev.forEach(index => {
        if (index < experienceFields.length) {
          newSet.add(index);
        }
      });
      return newSet;
    });
  }, [experienceFields.length]);

  // Track dirty state
  useEffect(() => {
    // No longer using sticky save bar
  }, []);

  const {
    fields: serviceFields,
    append: addService,
    remove: removeService,
  } = useFieldArray({
    control,
    name: "what_i_do",
  });

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
    // Clear previous errors
    setFieldErrors({});
    
    // Validate form
    const validationErrors = validateForm(values);
    
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      scrollToFirstError(validationErrors);
      return { success: false, message: "Please fix the errors below." };
    }
    
    const result = await onNext(values);
    const success = handleServerResponse(result);
    if (success) {
      setFieldErrors({});
    }
    return result;
  };

  

  const handleToggleCurrent = (index, checked) => {
    setValue(`experience.${index}.current`, checked, { shouldDirty: true });
    if (checked) {
      setValue(`experience.${index}.end_date`, "", { shouldDirty: true });
    } else {
      // If start exists and end is missing, surface a gentle inline error
      const s = getValues(`experience.${index}.start_date`);
      const e = getValues(`experience.${index}.end_date`);
      if (s && !e){
        setFieldErrors(prev => ({
          ...prev,
          [`experience.${index}`]: { ...(prev[`experience.${index}`]||{}), end_date: "Add an end date or re-enable 'Currently'." }
        }));
      }
    }
  };

  const onToggle = (i) => {
    setExpandedCards(prev => {
      const ns = new Set(prev);
      ns.has(i) ? ns.delete(i) : ns.add(i);
      return ns;
    });
  };

  const handleHeaderKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle(index);
    }
  };

  // Custom validation function
  const validateForm = (values) => {
    const errors = {};
    
    // Validate experiences
    if (!values.experience || values.experience.length === 0) {
      errors.experience = "Add at least one experience entry.";
      return errors;
    }

    values.experience.forEach((exp, index) => {
      const expErrors = {};
      
      // Required fields
      if (!exp.role || exp.role.trim() === '') {
        expErrors.role = "Role is required.";
      }
      
      if (!exp.company || exp.company.trim() === '') {
        expErrors.company = "Company is required.";
      }
      
      if (!exp.start_date || exp.start_date.trim() === '') {
        expErrors.start_date = "Start date is required.";
      }
      
      // End date validation - only if not currently working
      if (!exp.current && (!exp.end_date || exp.end_date.trim() === '')) {
        expErrors.end_date = "End date is required when not currently working.";
      }
      
      // Date range validation
      if (exp.start_date && exp.end_date && !exp.current) {
        const startDate = new Date(exp.start_date + '-01');
        const endDate = new Date(exp.end_date + '-01');
        
        if (endDate < startDate) {
          expErrors.end_date = "End date must be after start date.";
        }
      }
      
      if (Object.keys(expErrors).length > 0) {
        errors[`experience.${index}`] = expErrors;
      }
    });

    // Validate services
    if (values.what_i_do && values.what_i_do.length > 0) {
      values.what_i_do.forEach((service, index) => {
        const serviceErrors = {};
        
        if (!service.title || service.title.trim() === '') {
          serviceErrors.title = "Service name is required.";
        }
        
        if (!service.description || service.description.trim() === '') {
          serviceErrors.description = "Service description is required.";
        }
        
        if (Object.keys(serviceErrors).length > 0) {
          errors[`what_i_do.${index}`] = serviceErrors;
        }
      });
    }
    
    return errors;
  };

  // === TASK 6: robust scrollToFirstError ===
  const scrollToFirstError = (errs) => {
    const targets = [];

    // Walk nested structure
    Object.entries(errs).forEach(([key, val]) => {
      if (key.startsWith('experience.')) {
        // val is an object like { role: "...", company: "..." }
        const [, indexStr] = key.split('.');
        const idx = Number(indexStr);
        Object.keys(val).forEach(field => {
          targets.push({ id: `experience-${field}-${idx}`, idx });
        });
      }
      if (key.startsWith('what_i_do.')) {
        const [, indexStr] = key.split('.');
        const idx = Number(indexStr);
        Object.keys(errs[key]).forEach(field => {
          targets.push({ id: `service-${field}-${idx}` });
        });
      }
    });

    // Fallback to react-hook-form's own errors if custom errs is empty
    if (targets.length === 0) {
      const el = document.querySelector('.form-control.is-invalid');
      if (el) el.scrollIntoView({ behavior:'smooth', block:'center' });
      return;
    }

    const first = targets[0];
    // Ensure card open
    if (typeof first.idx === 'number') {
      setExpandedCards(prev => new Set([...prev, first.idx]));
    }

    setTimeout(() => {
      const node = document.getElementById(first.id);
      if (node) {
        node.scrollIntoView({ behavior:'smooth', block:'center' });
        node.focus({ preventScroll: true });
      }
    }, 100);
  };

  return (
    <form
      className="theme-form resume-form w-100"
      onSubmit={handleSubmit(submitForm)}
      noValidate
    >
      {serverError ? (
        <div className="error-message text-center mb-3">{serverError}</div>
      ) : null}

      <div className="info-row">
        <i className="info-row__icon fa fa-briefcase" aria-hidden="true"></i>
        <span className="info-row__text">Add your professional experience</span>
        <div className="info-row__tooltip">
          <span>i</span>
          <div className="info-row__tooltip-content">
            Highlight roles that shaped your career. Start with the latest and include 2–4 key achievements.
          </div>
        </div>
        <button
          type="button"
          className="resume-add-btn ms-auto add-exp-btn"
          onClick={() => addExperience(createExperience())}
          disabled={submitting}
          aria-label="Add experience"
        >
          <i className="fa fa-plus" aria-hidden="true"></i>
          <span className="btn-label">Add experience</span>
        </button>
      </div>

      {errors.experience?.message ? (
        <div className="error-message mb-3">{errors.experience.message}</div>
      ) : null}

      {experienceFields.length === 0 ? (
        <p className="text-muted fst-italic mb-3">
          Add your first experience entry to get started.
        </p>
      ) : null}

      {experienceFields.map((field, index) => {
        const roleValue = watch(`experience.${index}.role`);
        const companyValue = watch(`experience.${index}.company`);
        const startDate = watch(`experience.${index}.start_date`);
        const endDate = watch(`experience.${index}.end_date`);
        const isCurrent = Boolean(watch(`experience.${index}.current`));

        const dateRange = formatDateRange(startDate, endDate, isCurrent);
        const isExpanded = expandedCards.has(index);
        const bodyId = `exp-card-body-${index}`;

        return (
          <div className="exp-card card inner-card mb-4" key={field.id}>
            <div 
              className="exp-card__head"
              onClick={() => onToggle(index)}
              onKeyDown={(e) => handleHeaderKeyDown(e, index)}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              aria-controls={bodyId}
              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} experience: ${roleValue || "Role"} at ${companyValue || "Company"}`}
            >
              <div className="exp-card__title">
                <span className="role">{roleValue || "Role"}</span>
                <span className="separator">•</span>
                <span>{companyValue || "Company"}</span>
                <span className="separator">—</span>
                <span>{dateRange}</span>
              </div>
              <div className="exp-card__actions d-flex align-items-center gap-2">
                <div className="exp-card__toggle-icon">
                  <i className={`fa fa-chevron-${isExpanded ? 'up' : 'down'}`} aria-hidden="true"></i>
                </div>
                {experienceFields.length > 1 ? (
                  <button
                    type="button"
                    className="icon-btn delete-exp"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeExperience(index);
                    }}
                    disabled={submitting}
                    aria-label="Remove experience"
                    data-tooltip="Remove experience"
                  >
                    <i className="fa fa-trash" aria-hidden="true"></i>
                  </button>
                ) : null}
              </div>
            </div>
            <div 
              id={bodyId}
              className="exp-card__body"
              aria-hidden={!isExpanded}
              ref={(el) => {
                if (!el) return;
                const inner = el.firstChild;
                if (!inner) return;
                // animate height
                const target = isExpanded ? inner.scrollHeight : 0;
                el.style.height = target + 'px';
              }}
            >
              <div className="exp-card__body-inner">
              {/* Row A: Role | Company */}
              <div className="resume-card-grid experience-top-grid">
                <div className="form-group">
                  <label
                    className="form-label"
                    htmlFor={`experience-role-${index}`}
                  >
                    Role
                  </label>
                  <input
                    id={`experience-role-${index}`}
                    type="text"
                    className={`form-control ${
                      errors.experience?.[index]?.role || fieldErrors[`experience.${index}`]?.role ? "is-invalid" : ""
                    }`}
                    placeholder="Lead Engineer"
                    aria-invalid={errors.experience?.[index]?.role || fieldErrors[`experience.${index}`]?.role ? "true" : "false"}
                    aria-describedby={`err-experience-role-${index}`}
                    {...register(`experience.${index}.role`)}
                  />
                  {(errors.experience?.[index]?.role || fieldErrors[`experience.${index}`]?.role) && (
                    <div className="field__error" id={`err-experience-role-${index}`}>
                      {errors.experience?.[index]?.role?.message || fieldErrors[`experience.${index}`]?.role}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label
                    className="form-label"
                    htmlFor={`experience-company-${index}`}
                  >
                    Company
                  </label>
                  <input
                    id={`experience-company-${index}`}
                    type="text"
                    className={`form-control ${
                      errors.experience?.[index]?.company || fieldErrors[`experience.${index}`]?.company ? "is-invalid" : ""
                    }`}
                    placeholder="Acme Corp"
                    aria-invalid={errors.experience?.[index]?.company || fieldErrors[`experience.${index}`]?.company ? "true" : "false"}
                    aria-describedby={`err-experience-company-${index}`}
                    {...register(`experience.${index}.company`)}
                  />
                  {(errors.experience?.[index]?.company || fieldErrors[`experience.${index}`]?.company) && (
                    <div className="field__error" id={`err-experience-company-${index}`}>
                      {errors.experience?.[index]?.company?.message || fieldErrors[`experience.${index}`]?.company}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor={`experience-location-${index}`}>Location</label>
                  <input
                    id={`experience-location-${index}`}
                    type="text"
                    className={`form-control ${errors.experience?.[index]?.location ? "is-invalid" : ""}`}
                    placeholder="Remote"
                    {...register(`experience.${index}.location`)}
                  />
                  {errors.experience?.[index]?.location && (
                    <div className="field__error">
                      {errors.experience?.[index]?.location?.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Row B: Dates + toggle */}
              <div className="resume-card-grid experience-dates-grid mt-3">
                <div className="form-group">
                  <label className="form-label" htmlFor={`experience-start-${index}`}>Start date</label>
                  <input
                    id={`experience-start-${index}`}
                    type="month"
                    className={`form-control ${errors.experience?.[index]?.start_date || fieldErrors[`experience.${index}`]?.start_date ? "is-invalid" : ""}`}
                    aria-invalid={errors.experience?.[index]?.start_date || fieldErrors[`experience.${index}`]?.start_date ? "true" : "false"}
                    aria-describedby={`err-experience-start-${index}`}
                    {...register(`experience.${index}.start_date`)}
                  />
                  {(errors.experience?.[index]?.start_date || fieldErrors[`experience.${index}`]?.start_date) && (
                    <div className="field__error" id={`err-experience-start-${index}`}>
                      {errors.experience?.[index]?.start_date?.message || fieldErrors[`experience.${index}`]?.start_date}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor={`experience-end-${index}`}>
                    End date {isCurrent && <span className="date-hint">(auto "Present")</span>}
                  </label>
                  <input
                    id={`experience-end-${index}`}
                    type="month"
                    className={`form-control ${errors.experience?.[index]?.end_date || fieldErrors[`experience.${index}`]?.end_date ? "is-invalid" : ""}`}
                    disabled={isCurrent}
                    placeholder={isCurrent ? "Present" : ""}
                    aria-invalid={errors.experience?.[index]?.end_date || fieldErrors[`experience.${index}`]?.end_date ? "true" : "false"}
                    aria-describedby={`err-experience-end-${index}`}
                    {...register(`experience.${index}.end_date`)}
                  />
                  {(errors.experience?.[index]?.end_date || fieldErrors[`experience.${index}`]?.end_date) && (
                    <div className="field__error" id={`err-experience-end-${index}`}>
                      {errors.experience?.[index]?.end_date?.message || fieldErrors[`experience.${index}`]?.end_date}
                    </div>
                  )}
                </div>

                <div className="form-group align-self-end experience-toggle-group">
                  <Switch
                    id={`experience-current-${index}`}
                    checked={isCurrent}
                    onChange={(checked) => {
                      setValue(`experience.${index}.current`, checked, { shouldDirty: true });
                      handleToggleCurrent(index, checked);
                    }}
                    label="Currently working here"
                  />
                </div>
              </div>

              {/* Row D: Key contributions */}
                <div className="form-group full">
                  <label className="form-label" htmlFor={`experience-description-${index}`}>
                    Key contributions
                  </label>
                  <textarea
                    id={`experience-description-${index}`}
                    className={`form-control ${
                      errors.experience?.[index]?.description ? "is-invalid" : ""
                    }`}
                    rows={3}
                    placeholder="Highlight your impact, achievements, metrics…"
                    {...register(`experience.${index}.description`)}
                  />
                  {errors.experience?.[index]?.description ? (
                    <div className="field__error">
                      {errors.experience[index].description.message}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}


      <div className="info-row">
        <i className="info-row__icon fa fa-lightbulb-o" aria-hidden="true"></i>
        <span className="info-row__text">Describe your core services</span>
        <div className="info-row__tooltip">
          <span>i</span>
          <div className="info-row__tooltip-content">
            Describe your core offerings in 1–2 lines each. Focus on the value you deliver.
          </div>
        </div>
        <button
          type="button"
          className="resume-add-btn ms-auto add-service-btn"
          onClick={() => addService(createService())}
          disabled={submitting}
          aria-label="Add service"
        >
          <i className="fa fa-plus" aria-hidden="true"></i>
          <span className="btn-label">Add service</span>
        </button>
      </div>

      {serviceFields.length === 0 ? (
        <p className="text-muted fst-italic mb-3">
          Add your first service to describe your expertise.
        </p>
      ) : null}

      {serviceFields.map((field, index) => (
        <div className="service-card" key={field.id}>
          <div className="service-card__head">
            <div className="service-card__title">Service {index + 1}</div>
            <div className="service-card__inputs">
              <div className="form-group service-input service-input--title">
                <label className="form-label service-input__label" htmlFor={`service-title-${index}`}>
 
                  Service name
                </label>
                <input
                  id={`service-title-${index}`}
                  type="text"
                  className={`form-control ${
                    errors.what_i_do?.[index]?.title || fieldErrors[`what_i_do.${index}`]?.title ? "is-invalid" : ""
                  }`}
                  placeholder="e.g. Product strategy workshops"
                  aria-invalid={errors.what_i_do?.[index]?.title || fieldErrors[`what_i_do.${index}`]?.title ? "true" : "false"}
                  aria-describedby={`err-service-title-${index}`}
                  {...register(`what_i_do.${index}.title`)}
                />
                {(errors.what_i_do?.[index]?.title || fieldErrors[`what_i_do.${index}`]?.title) && (
                  <div className="field__error" id={`err-service-title-${index}`}>
                    {errors.what_i_do?.[index]?.title?.message || fieldErrors[`what_i_do.${index}`]?.title}
                  </div>
                )}
              </div>
              <div className="form-group service-input service-input--description">
                <label className="form-label service-input__label" htmlFor={`service-description-${index}`}>

                  Service description
                </label>
                <textarea
                  id={`service-description-${index}`}
                  className={`form-control ${
                    errors.what_i_do?.[index]?.description || fieldErrors[`what_i_do.${index}`]?.description ? "is-invalid" : ""
                  }`}
                  rows={1}
                  placeholder="Describe how you help in this area."
                  aria-invalid={errors.what_i_do?.[index]?.description || fieldErrors[`what_i_do.${index}`]?.description ? "true" : "false"}
                  aria-describedby={`err-service-description-${index}`}
                  {...register(`what_i_do.${index}.description`)}
                />
                {(errors.what_i_do?.[index]?.description || fieldErrors[`what_i_do.${index}`]?.description) && (
                  <div className="field__error" id={`err-service-description-${index}`}>
                    {errors.what_i_do?.[index]?.description?.message || fieldErrors[`what_i_do.${index}`]?.description}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              className="icon-btn delete-service"
              onClick={() => removeService(index)}
              disabled={submitting}
              aria-label="Remove service"
              data-tooltip="Remove service"
            >
              <i className="fa fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      ))}

      {/* Save Buttons */}
      <div className="text-center text-md-end mt-4">
        <div className="d-flex gap-3 justify-content-center justify-content-md-end">
          <PreviewButton 
            subdomain={defaultValues?.subdomain}
            disabled={submitting}
          />
          <button
            type="button"
            className="resume-save-btn"
            onClick={handleSubmit(submitForm)}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <i className="fa fa-spinner fa-pulse me-2" aria-hidden="true"></i>
                Saving…
              </>
            ) : (
              <>
                <i className="fa fa-save me-2" aria-hidden="true"></i>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ExperienceStep;

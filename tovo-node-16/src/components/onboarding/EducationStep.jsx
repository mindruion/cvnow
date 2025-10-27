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
import EntryCard from "../shared/EntryCard";
import Switch from "../shared/Switch";

/* ---------------- helpers ---------------- */
const fmtMonth = (v) => {
  if (!v) return "";
  const d = new Date(`${v}-01`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

const formatEducationTitle = (school, degree, start, end, current) => {
  const schoolText = school || "School";
  const degreeText = degree || "Degree";
  const startText = start ? fmtMonth(start) : "Start";
  const endText = current ? "Present" : (end ? fmtMonth(end) : "End");
  
  return `${schoolText} • ${degreeText} — ${startText} – ${endText}`;
};
const parseYyyyMm = (v) => (v ? new Date(`${v}-01`).getTime() : null);

/* --------------- validation ---------------- */
const educationItemSchema = yup.object({
  institution: yup.string().trim().required("School / University is required."),
  degree: yup.string().trim().required("Degree is required."),
  field_of_study: yup.string().nullable(),
  start_date: yup
    .string()
    .required("Start date is required."),
  current: yup.boolean().default(false),
  end_date: yup
    .string()
    .nullable()
    .when("current", {
      is: false,
      then: (s) => s.required("End date is required unless currently studying."),
    })
    .test("end-after-start", "End date can’t be before start date.", function (value) {
      const { start_date, current } = this.parent;
      if (!start_date || current || !value) return true;
      const s = parseYyyyMm(start_date);
      const e = parseYyyyMm(value);
      return s === null || e === null ? true : e >= s;
    }),
  notes: yup.string().nullable().max(500, "Keep notes under 500 characters."),
});

const educationSchema = yup.object({
  education: yup.array().of(educationItemSchema).min(1, "Add at least one education entry."),
});

const createEducation = () => ({
  institution: "",
  degree: "",
  field_of_study: "",
  start_date: "",
  end_date: "",
  current: false,
  notes: "",
  description: "",
});

export default function EducationStep({
  defaultValues,
  onNext,
  submitting,
  onChange,
  nextLabel = "Save",
}) {
  const [serverError, setServerError] = useState("");
  const [expanded, setExpanded] = useState(new Set([0])); // first card open
  const isResettingRef = useRef(false);
  const lastDefaultsRef = useRef("");

  /* ---------- defaults (normalized) ---------- */
  const sanitizedDefaults = useMemo(
    () => ({
      education: sanitizeArrayInput(defaultValues.education, createEducation).map((item) => {
        const start = toMonthInputValue(item.start_date);
        const end = toMonthInputValue(item.end_date);
        const current = Boolean(item.current ?? (!end && !!start));
        return {
          ...item,
          field_of_study: item.field_of_study || "",
          notes: item.notes ?? item.description ?? "",
          start_date: start,
          end_date: current ? "" : end,
          current,
        };
      }),
    }),
    [defaultValues]
  );

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
    resolver: yupResolver(educationSchema),
    defaultValues: sanitizedDefaults,
    mode: "onBlur",
  });

  useEffect(() => {
    let timerId;
    const snapshot = JSON.stringify(sanitizedDefaults);
    if (snapshot !== lastDefaultsRef.current) {
      const currentSnapshot = JSON.stringify(getValues());
      if (currentSnapshot !== snapshot) {
        isResettingRef.current = true;
        reset(sanitizedDefaults);
        timerId = setTimeout(() => (isResettingRef.current = false), 0);
      } else {
        isResettingRef.current = false;
      }
      lastDefaultsRef.current = snapshot;
    }
    return () => timerId && clearTimeout(timerId);
  }, [sanitizedDefaults, reset, getValues]);

  useEffect(() => {
    const subscription = watch((value) => {
      if (!isResettingRef.current && onChange) onChange(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  // Track dirty state
  useEffect(() => {
    // No longer using sticky save bar
  }, []);

  const { fields: educationFields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  // Duplicate education entry
  const duplicateEducation = (index) => {
    const currentValues = getValues();
    const educationToDuplicate = currentValues.education[index];
    
    // Create a copy without the id
    const duplicatedEducation = {
      ...educationToDuplicate,
      // Remove any unique identifiers that shouldn't be copied
    };
    
    // Insert the duplicated entry after the current one
    const newIndex = educationFields.length;
    append(duplicatedEducation);
    
    // Auto-expand the duplicated entry and collapse others
    setExpanded(new Set([newIndex]));
    
    // Scroll to the duplicated entry and focus first field
    setTimeout(() => {
      const cardElement = document.getElementById(`edu-card-body-${newIndex}`);
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Focus the first input field
        const firstInput = cardElement.querySelector('input');
        if (firstInput) {
          firstInput.focus({ preventScroll: true });
        }
      }
    }, 100);
  };

  // Delete education entry with confirmation
  const deleteEducation = (index) => {
    if (window.confirm("Delete this education entry?")) {
      remove(index);
    }
  };

  // Add education entry with auto-expand and collapse others
  const addEducation = () => {
    const newIndex = educationFields.length;
    append(createEducation());
    
    // Auto-expand the new entry and collapse others
    setExpanded(new Set([newIndex]));
    
    // Scroll to the new entry and focus first field after a short delay
    setTimeout(() => {
      const cardElement = document.getElementById(`edu-card-body-${newIndex}`);
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Focus the first input field
        const firstInput = cardElement.querySelector('input');
        if (firstInput) {
          firstInput.focus({ preventScroll: true });
        }
      }
    }, 100);
  };

  // Add first education entry (for empty state)
  const addFirstEducation = () => {
    addEducation();
  };

  const toggleCard = (i) =>
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  // Handle keyboard navigation on card headers
  const handleHeaderKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleCard(index);
    }
  };

  const handleServerResponse = (result) => {
    if (result?.success) {
      setServerError("");
      return true;
    }
    if (result?.fieldErrors) applyServerErrors(setError, result.fieldErrors);
    if (result?.message) setServerError(result.message);
    return false;
  };

  // Custom validation function similar to Experience
  const validateForm = (values) => {
    const errors = {};
    
    // Validate education entries
    if (!values.education || values.education.length === 0) {
      errors.education = "Add at least one education entry.";
      return errors;
    }

    values.education.forEach((edu, index) => {
      const eduErrors = {};
      
      // Required fields
      if (!edu.institution || edu.institution.trim() === '') {
        eduErrors.institution = "School / University is required.";
      }
      
      if (!edu.degree || edu.degree.trim() === '') {
        eduErrors.degree = "Degree is required.";
      }
      
      if (!edu.start_date || edu.start_date.trim() === '') {
        eduErrors.start_date = "Start date is required.";
      }
      
      // End date validation - only if not currently studying
      if (!edu.current && (!edu.end_date || edu.end_date.trim() === '')) {
        eduErrors.end_date = "End date is required when not currently studying.";
      }
      
      // Date range validation
      if (edu.start_date && edu.end_date && !edu.current) {
        const startDate = new Date(edu.start_date + '-01');
        const endDate = new Date(edu.end_date + '-01');
        
        if (endDate < startDate) {
          eduErrors.end_date = "End date must be after start date.";
        }
      }
      
      if (Object.keys(eduErrors).length > 0) {
        errors[`education.${index}`] = eduErrors;
      }
    });
    
    return errors;
  };

  const submitForm = async (values) => {
    // Validate form
    const validationErrors = validateForm(values);
    
    if (Object.keys(validationErrors).length > 0) {
      // Apply validation errors to form
      Object.entries(validationErrors).forEach(([key, val]) => {
        if (key === 'education') {
          setError('education', { message: val });
        } else if (key.startsWith('education.')) {
          const [, indexStr] = key.split('.');
          const idx = Number(indexStr);
          Object.entries(val).forEach(([field, message]) => {
            setError(`education.${idx}.${field}`, { message });
          });
        }
      });
      return;
    }
    
    const result = await onNext(values);
    const success = handleServerResponse(result);
    if (success) {
      // Success handled
    }
    return result;
  };

  return (
    <form className="theme-form resume-form w-100" onSubmit={handleSubmit(submitForm)} noValidate>
      {serverError && <div className="error-message text-center mb-3">{serverError}</div>}

      <div className="info-row">
        <i className="info-row__icon fa fa-graduation-cap" aria-hidden="true"></i>
        <span className="info-row__text">Add your academic milestones</span>
        <div className="info-row__tooltip">
          <span>i</span>
          <div className="info-row__tooltip-content">
            Share academic milestones that strengthen your expertise. Start with the most recent.
          </div>
        </div>
        <button
          type="button"
          className="resume-add-btn ms-auto add-edu-btn"
          onClick={addEducation}
          disabled={submitting}
          aria-label="Add education"
        >
          <i className="fa fa-plus" aria-hidden="true"></i>
          <span className="btn-label">Add education</span>
        </button>
      </div>

      {errors.education?.message && <div className="error-message mb-3">{errors.education.message}</div>}
      {educationFields.length === 0 && (
        <div className="empty-state-card mb-4">
          <div className="empty-state-card__icon">
            <i className="fa fa-graduation-cap" aria-hidden="true"></i>
          </div>
          <div className="empty-state-card__content">
            <h4 className="empty-state-card__title">Add your education to highlight your learning journey.</h4>
            <p className="empty-state-card__description">
              Showcase your academic achievements, degrees, and certifications that strengthen your professional profile.
            </p>
            <button
              type="button"
              className="empty-state-card__button"
              onClick={addFirstEducation}
              disabled={submitting}
            >
              <i className="fa fa-plus" aria-hidden="true"></i>
              Add education
            </button>
          </div>
        </div>
      )}

      {educationFields.map((field, index) => {
        const school = watch(`education.${index}.institution`);
        const degree = watch(`education.${index}.degree`);
        const start = watch(`education.${index}.start_date`);
        const end = watch(`education.${index}.end_date`);
        const current = watch(`education.${index}.current`);
        const open = expanded.has(index);

        const title = formatEducationTitle(school, degree, start, end, current);
        const bodyId = `edu-card-body-${index}`;

        return (
          <EntryCard
            key={field.id}
            title={title}
            isOpen={open}
            onToggle={() => toggleCard(index)}
            onDelete={() => deleteEducation(index)}
            onDuplicate={() => duplicateEducation(index)}
            bodyId={bodyId}
            ariaLabel={`${open ? 'Collapse' : 'Expand'} education: ${school || "School"} • ${degree || "Degree"}`}
            disabled={submitting}
            showDelete={educationFields.length > 1}
            showDuplicate={true}
            onHeaderKeyDown={(e) => handleHeaderKeyDown(e, index)}
          >
            <div className="resume-card-grid education-top-grid">
              <div className="form-group">
                <label className="form-label" htmlFor={`edu-school-${index}`}>School / University</label>
                <input
                  id={`edu-school-${index}`}
                  type="text"
                  className={`form-control ${errors.education?.[index]?.institution ? "is-invalid" : ""}`}
                  placeholder="e.g., University of Munich"
                  {...register(`education.${index}.institution`)}
                />
                {errors.education?.[index]?.institution && (
                  <div className="invalid-feedback d-block">{errors.education[index].institution.message}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor={`edu-degree-${index}`}>Degree</label>
                <input
                  id={`edu-degree-${index}`}
                  type="text"
                  className={`form-control ${errors.education?.[index]?.degree ? "is-invalid" : ""}`}
                  placeholder="e.g., BSc Computer Science"
                  {...register(`education.${index}.degree`)}
                />
                {errors.education?.[index]?.degree && (
                  <div className="invalid-feedback d-block">{errors.education[index].degree.message}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor={`edu-field-${index}`}>Field of study</label>
                <input
                  id={`edu-field-${index}`}
                  type="text"
                  className={`form-control ${errors.education?.[index]?.field_of_study ? "is-invalid" : ""}`}
                  placeholder="e.g., Artificial Intelligence"
                  {...register(`education.${index}.field_of_study`)}
                />
                {errors.education?.[index]?.field_of_study && (
                  <div className="invalid-feedback d-block">{errors.education[index].field_of_study.message}</div>
                )}
              </div>
            </div>

            <div className="resume-card-grid education-dates-grid mt-3">
              <div className="form-group">
                <label className="form-label" htmlFor={`edu-start-${index}`}>Start date</label>
                <input
                  id={`edu-start-${index}`}
                  type="month"
                  className={`form-control ${errors.education?.[index]?.start_date ? "is-invalid" : ""}`}
                  {...register(`education.${index}.start_date`, {
                    onChange: (e) => {
                      const startValue = e.target.value;
                      const endValue = watch(`education.${index}.end_date`);
                      const isCurrent = watch(`education.${index}.current`);
                      
                      // If start date is after end date and not current, clear end date
                      if (startValue && endValue && !isCurrent) {
                        const startDate = new Date(startValue + '-01');
                        const endDate = new Date(endValue + '-01');
                        
                        if (startDate > endDate) {
                          setValue(`education.${index}.end_date`, "", { shouldDirty: true });
                        }
                      }
                    }
                  })}
                />
                {errors.education?.[index]?.start_date && (
                  <div className="invalid-feedback d-block">{errors.education[index].start_date.message}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor={`edu-end-${index}`}>
                  End date {current && <span className="date-hint">(auto "Present")</span>}
                </label>
                <input
                  id={`edu-end-${index}`}
                  type="month"
                  disabled={current}
                  placeholder={current ? "Present" : ""}
                  min={start || undefined}
                  className={`form-control ${errors.education?.[index]?.end_date ? "is-invalid" : ""}`}
                  {...register(`education.${index}.end_date`, {
                    onChange: (e) => {
                      const endValue = e.target.value;
                      const startValue = watch(`education.${index}.start_date`);
                      const isCurrent = watch(`education.${index}.current`);
                      
                      // If end date is before start date and not current, show error
                      if (endValue && startValue && !isCurrent) {
                        const startDate = new Date(startValue + '-01');
                        const endDate = new Date(endValue + '-01');
                        
                        if (endDate < startDate) {
                          setValue(`education.${index}.end_date`, "", { shouldDirty: true });
                        }
                      }
                    }
                  })}
                />
                {errors.education?.[index]?.end_date && (
                  <div className="invalid-feedback d-block">{errors.education[index].end_date.message}</div>
                )}
              </div>

              <div className="form-group align-self-end education-toggle-group">
                <Switch
                  id={`edu-current-${index}`}
                  checked={current}
                  onChange={(checked) => {
                    // set the current value
                    setValue(`education.${index}.current`, checked, { shouldDirty: true });
                    // if current is ON, wipe end_date and revalidate
                    if (checked) {
                      setValue(`education.${index}.end_date`, "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                  label="Currently studying here"
                />
              </div>
            </div>

            <div className="form-group mt-3">
              <label className="form-label" htmlFor={`edu-notes-${index}`}>Notes (optional)</label>
              <textarea
                id={`edu-notes-${index}`}
                rows={3}
                placeholder="Honors, GPA, clubs, relevant coursework…"
                className={`form-control ${errors.education?.[index]?.notes ? "is-invalid" : ""}`}
                {...register(`education.${index}.notes`)}
              />
              {errors.education?.[index]?.notes && (
                <div className="invalid-feedback d-block">{errors.education[index].notes.message}</div>
              )}
            </div>
          </EntryCard>
        );
      })}


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
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

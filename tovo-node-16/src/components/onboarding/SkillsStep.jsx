import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import PreviewButton from "../shared/PreviewButton";
import {
  applyServerErrors,
  sanitizeArrayInput,
  clampPercentage,
  normalizePercentage,
} from "./stepUtils";
import TagsInput from "../shared/TagsInput";
import ConfirmModal from "../shared/ConfirmModal";

const LANGUAGE_LEVELS = ["Beginner", "Intermediate", "Advanced", "Native"];
const SKILL_DEFAULT_PERCENT = 50;
const LANGUAGE_DEFAULT_PERCENT = 70;

const percentageSchema = yup
  .number()
  .typeError("Percentage must be a number.")
  .min(0, "Minimum is 0%.")
  .max(100, "Maximum is 100%.")
  .required("Percentage is required.");

const workingSkillSchema = yup.object({
  title: yup.string().required("Skill name is required."),
  percentage: percentageSchema,
});

const knowledgeSchema = yup.object({
  value: yup.string().required("Keyword is required."),
});

const languageSchema = yup.object({
  title: yup.string().required("Language is required."),
  level: yup
    .string()
    .oneOf(LANGUAGE_LEVELS)
    .default("Intermediate"),
  percentage: percentageSchema,
});

const skillsSchema = yup.object({
  working_skills: yup.array().of(workingSkillSchema),
  knowledge: yup.array().of(knowledgeSchema),
  languages: yup.array().of(languageSchema),
});

const createSkill = () => ({
  title: "",
  percentage: SKILL_DEFAULT_PERCENT,
});

const createKeyword = () => ({
  value: "",
});

const createLanguage = () => ({
  title: "",
  level: "Intermediate",
  percentage: LANGUAGE_DEFAULT_PERCENT,
});

const SkillsStep = ({
  defaultValues,
  onNext,
  submitting,
  onChange,
  nextLabel = "Save",
}) => {
  const [serverError, setServerError] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    index: null,
    title: "",
    message: ""
  });
  const [newCardIds, setNewCardIds] = useState(new Set());

  const sanitizedDefaults = useMemo(
    () => ({
      working_skills: sanitizeArrayInput(
        defaultValues.working_skills,
        createSkill
      ).map((item) => ({
        ...item,
        percentage: normalizePercentage(
          item.percentage ?? item.level,
          SKILL_DEFAULT_PERCENT
        ),
      })),
      knowledge: sanitizeArrayInput(defaultValues.knowledge, createKeyword),
      languages: sanitizeArrayInput(defaultValues.languages, createLanguage).map(
        (item) => ({
          ...item,
          level: item.level || "Intermediate",
          percentage: normalizePercentage(
            item.percentage ?? item.proficiency,
            LANGUAGE_DEFAULT_PERCENT
          ),
        })
      ),
    }),
    [defaultValues]
  );

  const isResettingRef = useRef(false);
  const focusSkillInput = useCallback((index) => {
    if (typeof window === "undefined") {
      return;
    }
    const desktopInput = document.getElementById(`skill-name-${index}`);
    const mobileInput = document.getElementById(`skill-name-mobile-${index}`);
    const target = desktopInput || mobileInput;
    if (target) {
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const {
    handleSubmit,
    control,
    register,
    reset,
    watch,
    getValues,
    setError,
    setValue,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(skillsSchema),
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

  // Track dirty state
  useEffect(() => {
    // No longer using sticky save bar
  }, [isDirty]);

  const {
    fields: skillFields,
    append: addSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: "working_skills",
  });

  // Custom add skill function that opens new card in edit mode and collapses others
  const handleAddSkill = () => {
    addSkill(createSkill());
    const newIndex = skillFields.length;
    // Mark this card as new for animation
    setNewCardIds(prev => new Set([...prev, `skill-${newIndex}`]));
    // Scroll to the new card and focus name input after a short delay
    setTimeout(() => {
      focusSkillInput(newIndex);
    }, 120);
    // Remove animation class after animation completes
    setTimeout(() => {
      setNewCardIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(`skill-${newIndex}`);
        return newSet;
      });
    }, 200);
  };

  // Add language function with scroll into view
  const handleAddLanguage = () => {
    addLanguage(createLanguage());
    const newIndex = languageFields.length;
    // Mark this card as new for animation
    setNewCardIds(prev => new Set([...prev, `language-${newIndex}`]));
    // Scroll to the new card and focus name input after a short delay
    setTimeout(() => {
      const card = document.getElementById(`language-card-${newIndex}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const input = document.getElementById(`language-name-${newIndex}`);
      if (input) {
        input.focus({ preventScroll: true });
      }
    }, 120);
    // Remove animation class after animation completes
    setTimeout(() => {
      setNewCardIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(`language-${newIndex}`);
        return newSet;
      });
    }, 200);
  };

  // Duplicate handlers
  const handleDuplicateSkill = (index) => {
    const skillToDuplicate = skillFields[index];
    addSkill({
      title: skillToDuplicate.title,
      percentage: skillToDuplicate.percentage
    });
    const newIndex = skillFields.length;
    // Mark this card as duplicated for animation
    setNewCardIds(prev => new Set([...prev, `skill-${newIndex}`]));
    setTimeout(() => {
      focusSkillInput(newIndex);
    }, 120);
    // Remove animation class after animation completes
    setTimeout(() => {
      setNewCardIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(`skill-${newIndex}`);
        return newSet;
      });
    }, 200);
  };

  const handleDuplicateLanguage = (index) => {
    const languageToDuplicate = languageFields[index];
    addLanguage({
      title: languageToDuplicate.title,
      level: languageToDuplicate.level,
      percentage: languageToDuplicate.percentage
    });
    const newIndex = languageFields.length;
    // Mark this card as duplicated for animation
    setNewCardIds(prev => new Set([...prev, `language-${newIndex}`]));
    setTimeout(() => {
      const card = document.getElementById(`language-card-${newIndex}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const input = document.getElementById(`language-name-${newIndex}`);
      if (input) {
        input.focus({ preventScroll: true });
      }
    }, 120);
    // Remove animation class after animation completes
    setTimeout(() => {
      setNewCardIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(`language-${newIndex}`);
        return newSet;
      });
    }, 200);
  };

  // Delete confirmation handlers
  const handleDeleteSkill = (index) => {
    setConfirmModal({
      isOpen: true,
      type: 'skill',
      index,
      title: 'Delete Skill',
      message: 'Are you sure you want to delete this skill? This action cannot be undone.'
    });
  };

  const handleDeleteLanguage = (index) => {
    setConfirmModal({
      isOpen: true,
      type: 'language',
      index,
      title: 'Delete Language',
      message: 'Are you sure you want to delete this language? This action cannot be undone.'
    });
  };

  // Confirm delete
  const confirmDelete = () => {
    if (confirmModal.type === 'skill') {
      removeSkill(confirmModal.index);
    } else if (confirmModal.type === 'language') {
      removeLanguage(confirmModal.index);
    }
    setConfirmModal({ isOpen: false, type: null, index: null, title: "", message: "" });
  };

  // Drag and drop handlers
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.droppableId === 'skills' && destination.droppableId === 'skills') {
      // Reorder skills
      const items = Array.from(skillFields);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      
      // Update form values
      items.forEach((item, index) => {
        setValue(`working_skills.${index}.title`, item.title);
        setValue(`working_skills.${index}.percentage`, item.percentage);
      });
    } else if (source.droppableId === 'languages' && destination.droppableId === 'languages') {
      // Reorder languages
      const items = Array.from(languageFields);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      
      // Update form values
      items.forEach((item, index) => {
        setValue(`languages.${index}.title`, item.title);
        setValue(`languages.${index}.level`, item.level);
        setValue(`languages.${index}.percentage`, item.percentage);
      });
    }
  };

  const {
    fields: knowledgeFields,
    replace: replaceKnowledge,
  } = useFieldArray({
    control,
    name: "knowledge",
  });

  const {
    fields: languageFields,
    append: addLanguage,
    remove: removeLanguage,
  } = useFieldArray({
    control,
    name: "languages",
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
    setServerError("");
    
    // Validate form with custom validation
    const validationErrors = validateForm(values);
    
    if (Object.keys(validationErrors).length > 0) {
      // Apply validation errors to form
      Object.entries(validationErrors).forEach(([key, message]) => {
        setError(key, { message });
      });
      return;
    }
    
    const result = await onNext(values);
    const success = handleServerResponse(result);
    if (success) {
      // Show success toast
      showSuccessToast();
    }
    return result;
  };

  const handleSkillKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      
      // Check if current skill is valid
      const skillName = getValues(`working_skills.${index}.title`);
      
      if (skillName && skillName.trim() !== '') {
        // If valid, add a new skill and focus it
        handleAddSkill();
        // Focus will be handled by the new card's auto-focus
      }
    }
  };

  const handleLanguageKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      
      // Check if current language is valid
      const languageName = getValues(`languages.${index}.title`);
      const languageLevel = getValues(`languages.${index}.level`);
      
      if (languageName && languageName.trim() !== '' && languageLevel) {
        // If valid, add a new language and focus it
        handleAddLanguage();
        // Focus will be handled by the new card's auto-focus
      }
    }
  };

  const updatePercentage = (path, fallback, value) => {
    setValue(path, clampPercentage(value, fallback), { shouldDirty: true });
  };

  // Validation functions
  const validateUniqueSkills = (skills) => {
    const errors = {};
    const skillNames = new Set();
    
    skills.forEach((skill, index) => {
      if (skill.title) {
        const normalizedName = skill.title.toLowerCase().trim();
        if (skillNames.has(normalizedName)) {
          errors[`working_skills.${index}.title`] = "Skill name must be unique";
        } else {
          skillNames.add(normalizedName);
        }
      }
    });
    
    return errors;
  };

  const validateUniqueLanguages = (languages) => {
    const errors = {};
    const languageNames = new Set();
    
    languages.forEach((language, index) => {
      if (language.title) {
        const normalizedName = language.title.toLowerCase().trim();
        if (languageNames.has(normalizedName)) {
          errors[`languages.${index}.title`] = "Language must be unique";
        } else {
          languageNames.add(normalizedName);
        }
      }
    });
    
    return errors;
  };

  const validateKnowledgeTokens = (knowledge) => {
    const errors = {};
    const tokens = new Set();
    
    knowledge.forEach((item, index) => {
      if (item.value) {
        const trimmedValue = item.value.trim();
        if (!trimmedValue) {
          errors[`knowledge.${index}.value`] = "Keyword cannot be empty";
        } else if (tokens.has(trimmedValue.toLowerCase())) {
          errors[`knowledge.${index}.value`] = "Keyword must be unique";
        } else {
          tokens.add(trimmedValue.toLowerCase());
        }
      }
    });
    
    return errors;
  };

  const validateForm = (values) => {
    const errors = {};
    
    // Validate skills uniqueness
    if (values.working_skills) {
      const skillErrors = validateUniqueSkills(values.working_skills);
      Object.assign(errors, skillErrors);
    }
    
    // Validate languages uniqueness
    if (values.languages) {
      const languageErrors = validateUniqueLanguages(values.languages);
      Object.assign(errors, languageErrors);
    }
    
    // Validate knowledge tokens
    if (values.knowledge) {
      const knowledgeErrors = validateKnowledgeTokens(values.knowledge);
      Object.assign(errors, knowledgeErrors);
    }
    
    return errors;
  };

  // Success toast function
  const showSuccessToast = () => {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.innerHTML = `
      <div class="success-toast__content">
        <i class="fa fa-check-circle" aria-hidden="true"></i>
        <span>Changes saved successfully!</span>
      </div>
    `;
    
    // Add to body
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('visible'), 100);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  return (
    <div className="skills-page-container">
      <form
        className="theme-form resume-form w-100"
        onSubmit={handleSubmit(submitForm)}
        noValidate
      >
      {serverError ? (
        <div className="error-message text-center mb-3">{serverError}</div>
      ) : null}

      <section className="resume-step-card mb-4">
        <div>
          <i className="fa fa-cogs fa-lg" aria-hidden="true"></i>
        </div>
        <div>
          <h4 className="mb-2">Skills & finishing touches</h4>
          <p className="text-muted mb-0">
            Add your standout skills and language strengths before we assemble
            your resume.
          </p>
        </div>
      </section>

      <div className="skills-section-header">
        <h5 className="skills-section-title">Top skills</h5>
        <div className="skills-section-divider"></div>
        <button
          type="button"
          className="resume-add-btn add-skill-btn"
          onClick={handleAddSkill}
          disabled={submitting}
          aria-label="Add skill"
        >
          <i className="fa fa-plus" aria-hidden="true"></i>
          <span className="btn-label">Add skill</span>
        </button>
      </div>

      {skillFields.length === 0 ? (
        <p className="text-muted fst-italic mb-3">
          Add your first skill to showcase your strengths.
        </p>
      ) : null}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="skills">
          {(provided) => (
            <div
              className="skills-top"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {skillFields.map((field, index) => {
        const skillCardId = `skill-card-${index}`;
        const percentageValue = normalizePercentage(
          watch(`working_skills.${index}.percentage`),
          SKILL_DEFAULT_PERCENT
        );

        return (
          <Draggable key={field.id} draggableId={field.id} index={index} isDragDisabled>
            {(provided, snapshot) => (
              <div 
                id={skillCardId}
                className={`skill-item exp-card card inner-card mb-4 ${snapshot.isDragging ? 'dragging' : ''} ${newCardIds.has(`skill-${index}`) ? 'new-card' : ''}`}
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
            <div className="exp-card__head skill-card-header">
              <div className="skill-header-form">
                <div className="skill-header-form__desktop">
                  <div className="skill-input-group">
                    <input
                      id={`skill-name-${index}`}
                      type="text"
                      className={`skill-input ${errors.working_skills?.[index]?.title ? "is-invalid" : ""}`}
                      placeholder="e.g., React"
                      aria-invalid={errors.working_skills?.[index]?.title ? "true" : "false"}
                      aria-describedby={errors.working_skills?.[index]?.title ? `skill-error-${index}` : undefined}
                      {...register(`working_skills.${index}.title`)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => handleSkillKeyDown(e, index)}
                    />
                    {errors.working_skills?.[index]?.title && (
                      <div className="skill-error" id={`skill-error-${index}`}>
                        {errors.working_skills[index].title.message}
                      </div>
                    )}
                  </div>
                  <div className="skill-slider-group">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={percentageValue}
                      className="skill-range"
                      style={{
                        background: `linear-gradient(90deg, var(--resume-primary) ${percentageValue}%, rgba(3, 33, 54, 0.15) ${percentageValue}%)`,
                      }}
                      onChange={(event) => {
                        updatePercentage(
                          `working_skills.${index}.percentage`,
                          SKILL_DEFAULT_PERCENT,
                          event.target.value
                        );
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="skill-percentage">{percentageValue}%</span>
                  </div>
                </div>
                <div className="skill-header-form__mobile">
                  <div className="skill-item__row skill-item__row--header">
                    <div className="skill-item__name">
                      <input
                        id={`skill-name-mobile-${index}`}
                        type="text"
                        className={`skill-input ${errors.working_skills?.[index]?.title ? "is-invalid" : ""}`}
                        placeholder="e.g., React"
                        aria-invalid={errors.working_skills?.[index]?.title ? "true" : "false"}
                        aria-describedby={errors.working_skills?.[index]?.title ? `skill-error-mobile-${index}` : undefined}
                        {...register(`working_skills.${index}.title`)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => handleSkillKeyDown(e, index)}
                      />
                      {errors.working_skills?.[index]?.title && (
                        <div className="skill-error" id={`skill-error-mobile-${index}`}>
                          {errors.working_skills[index].title.message}
                        </div>
                      )}
                    </div>
                    <div
                      className="skill-item__percent skill-percentage"
                      aria-live="polite"
                    >
                      {percentageValue}%
                    </div>
                  </div>
                  <div className="skill-item__preview">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={percentageValue}
                      className="skill-range skill-item__range"
                      style={{
                        background: `linear-gradient(90deg, var(--resume-primary) ${percentageValue}%, rgba(3, 33, 54, 0.15) ${percentageValue}%)`,
                      }}
                      onChange={(event) => {
                        updatePercentage(
                          `working_skills.${index}.percentage`,
                          SKILL_DEFAULT_PERCENT,
                          event.target.value
                        );
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              </div>
              <div className="exp-card__actions skill-item__actions d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="icon-btn btn-skill-edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    focusSkillInput(index);
                  }}
                  disabled={submitting}
                  aria-label="Edit skill"
                  data-tooltip="Edit skill"
                >
                  <i className="fa fa-pencil" aria-hidden="true"></i>
                </button>
                <button
                  type="button"
                  className="icon-btn duplicate-entry skill-item__duplicate"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicateSkill(index);
                  }}
                  disabled={submitting}
                  aria-label="Duplicate skill"
                  data-tooltip="Duplicate skill"
                >
                  <i className="fa fa-copy" aria-hidden="true"></i>
                </button>
                <button
                  type="button"
                  className="icon-btn delete-exp btn-skill-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSkill(index);
                  }}
                  disabled={submitting}
                  aria-label="Remove skill"
                  data-tooltip="Remove skill"
                >
                  <i className="fa fa-trash" aria-hidden="true"></i>
                </button>
              </div>
            </div>
              </div>
            )}
          </Draggable>
        );
      })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>


      <div className="skills-section-header">
        <h5 className="skills-section-title">Knowledge highlights</h5>
        <div className="skills-section-divider"></div>
      </div>
      
      <div className="knowledge-section">
        <div className="knowledge-section__header">
          <p className="knowledge-section__help">Press Enter to add (1-3 words per keyword)</p>
        </div>
        
        <div className="knowledge-section__content">
          <TagsInput
            value={knowledgeFields.map(field => field.value ?? "").filter((tag) => tag !== null)}
            onChange={(tags) => {
              const normalized = tags
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);

              replaceKnowledge(
                normalized.map((value) => ({
                  value,
                }))
              );

              if (normalized.length === 0) {
                setValue("knowledge", [], { shouldDirty: true });
              }

              if (normalized.length > 0) {
                normalized.forEach((value, index) => {
                  setValue(`knowledge.${index}.value`, value, { shouldDirty: true });
                });
              }

              if (errors.knowledge) {
                clearErrors("knowledge");
              }
            }}
            placeholder="Add keyword and press Enter"
            maxItems={20}
            maxLines={2}
            disabled={submitting}
            error={errors.knowledge && Object.keys(errors.knowledge).length > 0 ? Object.values(errors.knowledge)[0]?.value?.message : null}
            id="knowledge-input"
          />
          
          {errors.knowledge && Object.keys(errors.knowledge).length > 0 && (
            <div className="knowledge-section__error">
              {Object.values(errors.knowledge).map((error, index) => (
                <div key={index} className="field__error">
                  {error.value?.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="skills-section-header">
        <h5 className="skills-section-title">Languages</h5>
        <div className="skills-section-divider"></div>
        <button
          type="button"
          className="resume-add-btn add-language-btn"
          onClick={handleAddLanguage}
          disabled={submitting}
          aria-label="Add language"
        >
          <i className="fa fa-plus" aria-hidden="true"></i>
          <span className="btn-label">Add language</span>
        </button>
      </div>

      {languageFields.length === 0 ? (
        <p className="text-muted fst-italic mb-3">
          Add the languages you speak and their proficiency level.
        </p>
      ) : null}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="languages">
          {(provided) => (
            <div
              className="languages-top"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {languageFields.map((field, index) => {
        const languageCardId = `language-card-${index}`;
        const percentageValue = normalizePercentage(
          watch(`languages.${index}.percentage`),
          LANGUAGE_DEFAULT_PERCENT
        );

        return (
          <Draggable key={field.id} draggableId={field.id} index={index} isDragDisabled>
            {(provided, snapshot) => (
              <div 
                id={languageCardId}
                className={`language-item exp-card card inner-card mb-4 ${snapshot.isDragging ? 'dragging' : ''} ${newCardIds.has(`language-${index}`) ? 'new-card' : ''}`}
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                <div className="exp-card__head language-card-header">
                  <div className="language-header-form">
                    <div className="language-header-form__desktop">
                      <div className="language-input-group">
                        <input
                          id={`language-name-${index}`}
                          type="text"
                          className={`language-input ${errors.languages?.[index]?.title ? "is-invalid" : ""}`}
                          placeholder="e.g., English"
                          aria-invalid={errors.languages?.[index]?.title ? "true" : "false"}
                          aria-describedby={errors.languages?.[index]?.title ? `language-error-${index}` : undefined}
                          {...register(`languages.${index}.title`)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => handleLanguageKeyDown(e, index)}
                        />
                        {errors.languages?.[index]?.title && (
                          <div className="language-error" id={`language-error-${index}`}>
                            {errors.languages[index].title.message}
                          </div>
                        )}
                      </div>
                      
                      <div className="language-select-group">
                        <select
                          id={`language-level-${index}`}
                          className={`language-select ${errors.languages?.[index]?.level ? "is-invalid" : ""}`}
                          aria-invalid={errors.languages?.[index]?.level ? "true" : "false"}
                          aria-describedby={errors.languages?.[index]?.level ? `language-level-error-${index}` : undefined}
                          {...register(`languages.${index}.level`)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {LANGUAGE_LEVELS.map((level) => (
                            <option key={level} value={level}>
                              {level}
                            </option>
                          ))}
                        </select>
                        {errors.languages?.[index]?.level && (
                          <div className="language-error" id={`language-level-error-${index}`}>
                            {errors.languages[index].level.message}
                          </div>
                        )}
                      </div>
                      
                      <div className="language-slider-group">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={percentageValue}
                          className="language-range"
                          style={{
                            background: `linear-gradient(90deg, var(--resume-primary) ${percentageValue}%, rgba(3, 33, 54, 0.15) ${percentageValue}%)`,
                          }}
                          onChange={(event) => {
                            updatePercentage(
                              `languages.${index}.percentage`,
                              LANGUAGE_DEFAULT_PERCENT,
                              event.target.value
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="language-percentage">{percentageValue}%</span>
                      </div>
                    </div>
                    
                    <div className="language-header-form__mobile">
                      <div className="language-item__row language-item__row--header">
                        <div className="language-item__name">
                          <input
                            id={`language-name-mobile-${index}`}
                            type="text"
                            className={`language-input ${errors.languages?.[index]?.title ? "is-invalid" : ""}`}
                            placeholder="e.g., English"
                            aria-invalid={errors.languages?.[index]?.title ? "true" : "false"}
                            aria-describedby={errors.languages?.[index]?.title ? `language-error-mobile-${index}` : undefined}
                            {...register(`languages.${index}.title`)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => handleLanguageKeyDown(e, index)}
                          />
                          {errors.languages?.[index]?.title && (
                            <div className="language-error" id={`language-error-mobile-${index}`}>
                              {errors.languages[index].title.message}
                            </div>
                          )}
                        </div>
                        <div
                          className="language-item__percent language-percentage"
                          aria-live="polite"
                        >
                          {percentageValue}%
                        </div>
                      </div>
                      
                      <div className="language-controls-row">
                        <div className="language-select-group">
                          <select
                            id={`language-level-mobile-${index}`}
                            className={`language-select ${errors.languages?.[index]?.level ? "is-invalid" : ""}`}
                            aria-invalid={errors.languages?.[index]?.level ? "true" : "false"}
                            aria-describedby={errors.languages?.[index]?.level ? `language-level-error-mobile-${index}` : undefined}
                            {...register(`languages.${index}.level`)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {LANGUAGE_LEVELS.map((level) => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </select>
                          {errors.languages?.[index]?.level && (
                            <div className="language-error" id={`language-level-error-mobile-${index}`}>
                              {errors.languages[index].level.message}
                            </div>
                          )}
                        </div>
                        
                        <div className="language-slider-group">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            value={percentageValue}
                            className="language-range language-item__range"
                            style={{
                              background: `linear-gradient(90deg, var(--resume-primary) ${percentageValue}%, rgba(3, 33, 54, 0.15) ${percentageValue}%)`,
                            }}
                            onChange={(event) => {
                              updatePercentage(
                                `languages.${index}.percentage`,
                                LANGUAGE_DEFAULT_PERCENT,
                                event.target.value
                              );
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="exp-card__actions language-item__actions d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="icon-btn duplicate-entry language-item__duplicate"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateLanguage(index);
                      }}
                      disabled={submitting}
                      aria-label="Duplicate language"
                      data-tooltip="Duplicate language"
                    >
                      <i className="fa fa-copy" aria-hidden="true"></i>
                    </button>
                    <button
                      type="button"
                      className="icon-btn delete-exp btn-language-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLanguage(index);
                      }}
                      disabled={submitting}
                      aria-label="Remove language"
                      data-tooltip="Remove language"
                    >
                      <i className="fa fa-trash" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Draggable>
        );
      })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
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
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, type: null, index: null, title: "", message: "" })}
        onConfirm={confirmDelete}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default SkillsStep;

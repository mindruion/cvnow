import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ResumeAccordionSection from "./ResumeAccordionSection";
import { mergeResumeDefaults } from "../utils/resumeDefaults";
import { formatDateToIso } from "./onboarding/stepUtils";
import { DEFAULT_THEME_STATE } from "../utils/themePresets";

const resumeSchema = yup.object({
  profession: yup.string().required("Profession is required."),
  phone: yup.string().required("Phone number is required."),
  email: yup
    .string()
    .email("Please provide a valid email.")
    .required("Email is required."),
  location: yup.string().required("Location is required."),
  birth_date: yup.string().nullable(),
  facebook: yup.string().url("Must be a valid URL.").nullable(),
  linkedin: yup.string().url("Must be a valid URL.").nullable(),
  avatar: yup.string().nullable(),
  theme: yup.mixed().default(DEFAULT_THEME_STATE.theme),
  layout: yup.mixed().default(DEFAULT_THEME_STATE.layout),
  features: yup.mixed().default(DEFAULT_THEME_STATE.features),
  content: yup.mixed().default(DEFAULT_THEME_STATE.content),
  include_blogs: yup.boolean(),
  can_download_cv: yup.boolean(),
  language_used: yup.string().required("Primary language is required."),
  about: yup.object({
    short_description: yup.string().required("Headline is required."),
    description: yup.string().required("About description is required."),
  }),
  what_i_do: yup
    .array()
    .of(
      yup.object({
        title: yup.string().required("Title is required."),
        description: yup.string().required("Description is required."),
      })
    )
    .default([]),
  education: yup
    .array()
    .of(
      yup.object({
        place: yup.string().required("Institution is required."),
        title: yup.string().required("Degree is required."),
        start_date: yup.string().required("Start date is required."),
        end_date: yup.string().nullable(),
      })
    )
    .default([]),
  experience: yup
    .array()
    .of(
      yup.object({
        place: yup.string().required("Company is required."),
        title: yup.string().required("Role is required."),
        start_date: yup.string().required("Start date is required."),
        end_date: yup.string().nullable(),
      })
    )
    .default([]),
  working_skills: yup
    .array()
    .of(
      yup.object({
        name: yup.string().required("Skill is required."),
        level: yup.string().required("Skill level is required."),
      })
    )
    .default([]),
  knowledge: yup
    .array()
    .of(
      yup.object({
        value: yup.string().required("Knowledge item cannot be empty."),
      })
    )
    .default([]),
  languages: yup
    .array()
    .of(
      yup.object({
        name: yup.string().required("Language is required."),
        level: yup.string().required("Proficiency is required."),
      })
    )
    .default([]),
});

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

const ResumeForm = ({
  initialValues,
  onSubmit,
  isSaving,
  registerSubmitHandler,
}) => {
  const normalizedDefaults = useMemo(() => {
    const base = mergeResumeDefaults(initialValues);
    return {
      ...base,
      knowledge: (base.knowledge || []).map((item) =>
        typeof item === "string" ? { value: item } : item
      ),
    };
  }, [initialValues]);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    normalizedDefaults.avatar || ""
  );

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors, isDirty },
    watch,
  } = useForm({
    resolver: yupResolver(resumeSchema),
    defaultValues: normalizedDefaults,
    mode: "onBlur",
  });

  useEffect(() => {
    reset(normalizedDefaults);
    setAvatarFile(null);
    setAvatarPreview(normalizedDefaults.avatar || "");
  }, [normalizedDefaults, reset]);

  const {
    fields: services,
    append: addService,
    remove: removeService,
  } = useFieldArray({ control, name: "what_i_do" });

  const {
    fields: education,
    append: addEducation,
    remove: removeEducation,
  } = useFieldArray({ control, name: "education" });

  const {
    fields: experience,
    append: addExperience,
    remove: removeExperience,
  } = useFieldArray({ control, name: "experience" });

  const {
    fields: workingSkills,
    append: addWorkingSkill,
    remove: removeWorkingSkill,
  } = useFieldArray({ control, name: "working_skills" });

  const { fields: knowledge, append: addKnowledge, remove: removeKnowledge } =
    useFieldArray({ control, name: "knowledge" });

  const { fields: languages, append: addLanguage, remove: removeLanguage } =
    useFieldArray({ control, name: "languages" });

  const submitResume = useCallback(
    async (values) => {
      const payload = {
        ...values,
        knowledge: values.knowledge.map((item) => item.value),
        education: (values.education || []).map((item) => ({
          ...item,
          start_date: formatDateToIso(item.start_date),
          end_date: formatDateToIso(item.end_date),
        })),
        experience: (values.experience || []).map((item) => ({
          ...item,
          start_date: formatDateToIso(item.start_date),
          end_date: formatDateToIso(item.end_date),
        })),
        birth_date: formatDateToIso(values.birth_date),
      };

      payload.config = {
        theme: values.theme,
        layout: values.layout,
        features: values.features,
        content: values.content,
      };

      delete payload.theme;
      delete payload.layout;
      delete payload.features;
      delete payload.content;

      if (avatarFile) {
        try {
          const base64 = await fileToBase64(avatarFile);
          payload.avatar_upload = base64;
        } catch (error) {
          payload.avatar_upload = null;
        }
      }

      await onSubmit(payload);
    },
    [avatarFile, onSubmit]
  );

  const submitForm = useCallback(() => {
    return handleSubmit(submitResume)();
  }, [handleSubmit, submitResume]);

  useEffect(() => {
    if (registerSubmitHandler) {
      registerSubmitHandler(submitForm);
      return () => registerSubmitHandler(null);
    }
  }, [registerSubmitHandler, submitForm]);

  const getError = (path) => {
    const segments = path.split(".");
    return segments.reduce((acc, key) => (acc ? acc[key] : undefined), errors);
  };

  const renderTextInput = (
    name,
    label,
    placeholder,
    type = "text",
    extraProps = {}
  ) => (
    <div className="form-group">
      {label ? <label className="form-label">{label}</label> : null}
      <input
        type={type}
        className={`form-control ${getError(name) ? "is-invalid" : ""}`}
        placeholder={placeholder}
        {...register(name)}
        {...extraProps}
      />
      {getError(name) ? (
        <div className="invalid-feedback d-block">{getError(name)?.message}</div>
      ) : null}
    </div>
  );

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const [expandedServiceIndex, setExpandedServiceIndex] = useState(
    services.length ? 0 : 0
  );
  const [expandedEducationIndex, setExpandedEducationIndex] = useState(
    education.length ? 0 : 0
  );
  const [expandedExperienceIndex, setExpandedExperienceIndex] = useState(
    experience.length ? 0 : 0
  );
  const [expandedSkillIndex, setExpandedSkillIndex] = useState(
    workingSkills.length ? 0 : 0
  );
  const [expandedLanguageIndex, setExpandedLanguageIndex] = useState(
    languages.length ? 0 : 0
  );

  useEffect(() => {
    if (!services.length) {
      setExpandedServiceIndex(-1);
      return;
    }
    if (expandedServiceIndex > services.length - 1) {
      setExpandedServiceIndex(Math.max(services.length - 1, 0));
    }
  }, [services.length, expandedServiceIndex]);

  useEffect(() => {
    if (!education.length) {
      setExpandedEducationIndex(-1);
      return;
    }
    if (expandedEducationIndex > education.length - 1) {
      setExpandedEducationIndex(Math.max(education.length - 1, 0));
    }
  }, [education.length, expandedEducationIndex]);

  useEffect(() => {
    if (!experience.length) {
      setExpandedExperienceIndex(-1);
      return;
    }
    if (expandedExperienceIndex > experience.length - 1) {
      setExpandedExperienceIndex(Math.max(experience.length - 1, 0));
    }
  }, [experience.length, expandedExperienceIndex]);

  useEffect(() => {
    if (!workingSkills.length) {
      setExpandedSkillIndex(-1);
      return;
    }
    if (expandedSkillIndex > workingSkills.length - 1) {
      setExpandedSkillIndex(Math.max(workingSkills.length - 1, 0));
    }
  }, [workingSkills.length, expandedSkillIndex]);

  useEffect(() => {
    if (!languages.length) {
      setExpandedLanguageIndex(-1);
      return;
    }
    if (expandedLanguageIndex > languages.length - 1) {
      setExpandedLanguageIndex(Math.max(languages.length - 1, 0));
    }
  }, [languages.length, expandedLanguageIndex]);

  const ServiceItemFields = ({ index }) => {
    const titleValue = watch(`what_i_do.${index}.title`);

    return (
      <div className={`collapsible-item ${expandedServiceIndex === index ? "open" : ""}`}>
        <button
          type="button"
          className="collapsible-item-header"
          onClick={() =>
            setExpandedServiceIndex((prev) => (prev === index ? -1 : index))
          }
        >
          <div className="collapsible-item-header-left">
            <div className="collapsible-badge">{index + 1}</div>
            <div className="collapsible-label">
              <span className="collapsible-title">
                {titleValue || "Untitled service"}
              </span>
              <small>
                {expandedServiceIndex === index
                  ? "Tap to collapse"
                  : "Tap to expand"}
              </small>
            </div>
          </div>
          <i
            className={`fa ${
              expandedServiceIndex === index ? "fa-chevron-up" : "fa-chevron-down"
            }`}
            aria-hidden="true"
          ></i>
        </button>
        <div
          className={`collapsible-body ${
            expandedServiceIndex === index ? "show" : ""
          }`}
        >
          {renderTextInput(
            `what_i_do.${index}.title`,
            "Service headline",
            "e.g. Product design sprints"
          )}
          <div className="form-group mb-0">
            <label className="form-label">Elevator pitch</label>
            <textarea
              className={`form-control ${
                getError(`what_i_do.${index}.description`) ? "is-invalid" : ""
              }`}
              rows={3}
              placeholder="In two sentences, explain the value you deliver."
              {...register(`what_i_do.${index}.description`)}
            />
            {getError(`what_i_do.${index}.description`) ? (
              <div className="invalid-feedback d-block">
                {getError(`what_i_do.${index}.description`)?.message}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  const EducationItemFields = ({ index }) => {
    const place = watch(`education.${index}.place`);
    const title = watch(`education.${index}.title`);

    return (
      <div className={`collapsible-item ${expandedEducationIndex === index ? "open" : ""}`}>
        <button
          type="button"
          className="collapsible-item-header"
          onClick={() =>
            setExpandedEducationIndex((prev) => (prev === index ? -1 : index))
          }
        >
          <div className="collapsible-item-header-left">
            <div className="collapsible-badge">{index + 1}</div>
            <div className="collapsible-label">
              <span className="collapsible-title">
                {place || "Untitled education"}
              </span>
              <small>{title || "Add degree details"}</small>
            </div>
          </div>
          <i
            className={`fa ${
              expandedEducationIndex === index ? "fa-chevron-up" : "fa-chevron-down"
            }`}
            aria-hidden="true"
          ></i>
        </button>
        <div
          className={`collapsible-body ${
            expandedEducationIndex === index ? "show" : ""
          }`}
        >
          <div className="resume-card-grid wider">
            {renderTextInput(
              `education.${index}.place`,
              "School / Institution",
              "University of Copenhagen"
            )}
            {renderTextInput(
              `education.${index}.title`,
              "Degree / Specialisation",
              "BSc Computer Science"
            )}
            {renderTextInput(
              `education.${index}.start_date`,
              "Start Date",
              "",
              "date"
            )}
            {renderTextInput(
              `education.${index}.end_date`,
              "End Date",
              "",
              "date"
            )}
          </div>
        </div>
      </div>
    );
  };

  const ExperienceItemFields = ({ index }) => {
    const place = watch(`experience.${index}.place`);
    const title = watch(`experience.${index}.title`);

    return (
      <div className={`collapsible-item ${expandedExperienceIndex === index ? "open" : ""}`}>
        <button
          type="button"
          className="collapsible-item-header"
          onClick={() =>
            setExpandedExperienceIndex((prev) => (prev === index ? -1 : index))
          }
        >
          <div className="collapsible-item-header-left">
            <div className="collapsible-badge">{index + 1}</div>
            <div className="collapsible-label">
              <span className="collapsible-title">{title || "Role"}</span>
              <small>{place || "Company"}</small>
            </div>
          </div>
          <i
            className={`fa ${
              expandedExperienceIndex === index
                ? "fa-chevron-up"
                : "fa-chevron-down"
            }`}
            aria-hidden="true"
          ></i>
        </button>
        <div
          className={`collapsible-body ${
            expandedExperienceIndex === index ? "show" : ""
          }`}
        >
          <div className="resume-card-grid wider">
            {renderTextInput(
              `experience.${index}.place`,
              "Company",
              "Acme Corp"
            )}
            {renderTextInput(
              `experience.${index}.title`,
              "Role",
              "Lead Engineer"
            )}
            {renderTextInput(
              `experience.${index}.start_date`,
              "Start Date",
              "",
              "date"
            )}
            {renderTextInput(
              `experience.${index}.end_date`,
              "End Date",
              "",
              "date"
            )}
          </div>
        </div>
      </div>
    );
  };

  const WorkingSkillItemFields = ({ index }) => {
    const name = watch(`working_skills.${index}.name`);
    const level = watch(`working_skills.${index}.level`);

    return (
      <div className={`collapsible-item ${expandedSkillIndex === index ? "open" : ""}`}>
        <button
          type="button"
          className="collapsible-item-header"
          onClick={() =>
            setExpandedSkillIndex((prev) => (prev === index ? -1 : index))
          }
        >
          <div className="collapsible-item-header-left">
            <div className="collapsible-badge">{index + 1}</div>
            <div className="collapsible-label">
              <span className="collapsible-title">{name || "Unnamed skill"}</span>
              <small>{level || "Add proficiency"}</small>
            </div>
          </div>
          <i
            className={`fa ${
              expandedSkillIndex === index ? "fa-chevron-up" : "fa-chevron-down"
            }`}
            aria-hidden="true"
          ></i>
        </button>
        <div
          className={`collapsible-body ${
            expandedSkillIndex === index ? "show" : ""
          }`}
        >
          <div className="resume-card-grid compact">
            {renderTextInput(
              `working_skills.${index}.name`,
              "Skill",
              "JavaScript, Python, Figma …"
            )}
            {renderTextInput(
              `working_skills.${index}.level`,
              "Proficiency",
              "Expert / Advanced / Intermediate"
            )}
          </div>
        </div>
      </div>
    );
  };

  const LanguageItemFields = ({ index }) => {
    const name = watch(`languages.${index}.name`);
    const level = watch(`languages.${index}.level`);

    return (
      <div className={`collapsible-item ${expandedLanguageIndex === index ? "open" : ""}`}>
        <button
          type="button"
          className="collapsible-item-header"
          onClick={() =>
            setExpandedLanguageIndex((prev) => (prev === index ? -1 : index))
          }
        >
          <div className="collapsible-item-header-left">
            <div className="collapsible-badge">{index + 1}</div>
            <div className="collapsible-label">
              <span className="collapsible-title">{name || "Language"}</span>
              <small>{level || "Add proficiency"}</small>
            </div>
          </div>
          <i
            className={`fa ${
              expandedLanguageIndex === index
                ? "fa-chevron-up"
                : "fa-chevron-down"
            }`}
            aria-hidden="true"
          ></i>
        </button>
        <div
          className={`collapsible-body ${
            expandedLanguageIndex === index ? "show" : ""
          }`}
        >
          <div className="resume-card-grid compact">
            {renderTextInput(
              `languages.${index}.name`,
              "Language",
              "English"
            )}
            {renderTextInput(
              `languages.${index}.level`,
              "Proficiency",
              "Native / Fluent / Beginner"
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleAddService = () => {
    const newIndex = services.length;
    addService({
      title: "",
      description: "",
    });
    setExpandedServiceIndex(newIndex);
  };

  const handleRemoveService = (index) => {
    removeService(index);
    setExpandedServiceIndex((prev) => {
      const remaining = services.length - 1;
      if (remaining <= 0) {
        return -1;
      }
      if (prev === index) {
        return Math.max(index - 1, 0);
      }
      if (prev > index) {
        return prev - 1;
      }
      return prev;
    });
  };

  const handleAddEducation = () => {
    const newIndex = education.length;
    addEducation({
      place: "",
      title: "",
      start_date: "",
      end_date: "",
    });
    setExpandedEducationIndex(newIndex);
  };

  const handleRemoveEducation = (index) => {
    removeEducation(index);
    setExpandedEducationIndex((prev) => {
      const remaining = education.length - 1;
      if (remaining <= 0) {
        return 0;
      }
      if (prev === index) {
        return Math.max(index - 1, 0);
      }
      if (prev > index) {
        return prev - 1;
      }
      return prev;
    });
  };

  const handleAddExperience = () => {
    const newIndex = experience.length;
    addExperience({
      place: "",
      title: "",
      start_date: "",
      end_date: "",
    });
    setExpandedExperienceIndex(newIndex);
  };

  const handleRemoveExperience = (index) => {
    removeExperience(index);
    setExpandedExperienceIndex((prev) => {
      const remaining = experience.length - 1;
      if (remaining <= 0) {
        return 0;
      }
      if (prev === index) {
        return Math.max(index - 1, 0);
      }
      if (prev > index) {
        return prev - 1;
      }
      return prev;
    });
  };

  const handleAddSkill = () => {
    const newIndex = workingSkills.length;
    addWorkingSkill({
      name: "",
      level: "",
    });
    setExpandedSkillIndex(newIndex);
  };

  const handleRemoveSkill = (index) => {
    removeWorkingSkill(index);
    setExpandedSkillIndex((prev) => {
      const remaining = workingSkills.length - 1;
      if (remaining <= 0) {
        return 0;
      }
      if (prev === index) {
        return Math.max(index - 1, 0);
      }
      if (prev > index) {
        return prev - 1;
      }
      return prev;
    });
  };

  const handleAddLanguage = () => {
    const newIndex = languages.length;
    addLanguage({
      name: "",
      level: "",
    });
    setExpandedLanguageIndex(newIndex);
  };

  const handleRemoveLanguage = (index) => {
    removeLanguage(index);
    setExpandedLanguageIndex((prev) => {
      const remaining = languages.length - 1;
      if (remaining <= 0) {
        return 0;
      }
      if (prev === index) {
        return Math.max(index - 1, 0);
      }
      if (prev > index) {
        return prev - 1;
      }
      return prev;
    });
  };

  return (
    <form
      className="theme-form resume-form w-100"
      onSubmit={handleSubmit(submitResume)}
      noValidate
    >
      <input type="hidden" {...register("avatar")} />

      <div className="resume-layout">
        <div className="resume-primary-card">
          <div className="resume-grid">
            {renderTextInput(
              "profession",
              "Profession",
              "Full Stack Developer"
            )}
            {renderTextInput("phone", "Phone", "+123 456 7890")}
            {renderTextInput(
              "email",
              "Email",
              "me@example.com",
              "email"
            )}
            {renderTextInput("location", "Location", "Berlin, Germany")}
            {renderTextInput("birth_date", "Birth Date", "", "date")}
            {renderTextInput(
              "facebook",
              "Facebook",
              "https://facebook.com/myprofile"
            )}
            {renderTextInput(
              "linkedin",
              "LinkedIn",
              "https://linkedin.com/in/myprofile"
            )}
            {renderTextInput("language_used", "Primary Language", "en")}
          </div>

          <div className="resume-toggle-group">
            <Controller
              control={control}
              name="include_blogs"
              render={({ field }) => (
                <label className="resume-toggle">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
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
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                  <span className="slider" />
                  <span className="label-text">
                    Allow visitors to download my CV
                  </span>
                </label>
              )}
            />
          </div>
        </div>

        <aside className="resume-profile-card">
          <div
            className="avatar-preview"
            style={
              avatarPreview
                ? { backgroundImage: `url(${avatarPreview})` }
                : undefined
            }
          >
            {!avatarPreview ? (
              <span className="placeholder">Upload avatar</span>
            ) : null}
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
                setAvatarPreview(normalizedDefaults.avatar || "");
              }}
              disabled={!avatarFile && !normalizedDefaults.avatar}
            >
              <i className="fa fa-undo" aria-hidden="true"></i>
              Reset to original
            </button>
          </div>
        </aside>
      </div>

      <hr />

      <section className="resume-about-block">
        <div className="about-card">
          <header>
            <h5>About</h5>
            <p className="text-muted">
              Tell people who you are and what matters to you.
            </p>
          </header>
          <div className="row">
            <div className="col-md-5">
              {renderTextInput("about.short_description", "Headline", "About Me")}
            </div>
            <div className="col-md-7">
              <div className="form-group">
                <label className="form-label">Short bio</label>
                <textarea
                  className={`form-control ${
                    getError("about.description") ? "is-invalid" : ""
                  }`}
                  placeholder="Write a short introduction..."
                  rows={4}
                  {...register("about.description")}
                />
                {getError("about.description") ? (
                  <div className="invalid-feedback d-block">
                    {getError("about.description")?.message}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ResumeAccordionSection
        title="What I Do"
        subtitle="Capture your core services or offerings in punchy, reader-friendly blurbs."
        items={services}
        addLabel="Add service"
        onAdd={handleAddService}
        onRemove={handleRemoveService}
        itemClassName="no-card"
        renderItem={(_, index) => <ServiceItemFields index={index} />}
      />

      <ResumeAccordionSection
        title="Education"
        subtitle="List your academic background."
        items={education}
        addLabel="Add education"
        onAdd={handleAddEducation}
        onRemove={handleRemoveEducation}
        itemClassName="no-card"
        renderItem={(_, index) => <EducationItemFields index={index} />}
      />

      <ResumeAccordionSection
        title="Experience"
        subtitle="Share your professional journey."
        items={experience}
        addLabel="Add experience"
        onAdd={handleAddExperience}
        onRemove={handleRemoveExperience}
        itemClassName="no-card"
        renderItem={(_, index) => <ExperienceItemFields index={index} />}
      />

      <ResumeAccordionSection
        title="Working Skills"
        subtitle="List skills with their proficiency."
        items={workingSkills}
        addLabel="Add skill"
        onAdd={handleAddSkill}
        onRemove={handleRemoveSkill}
        itemClassName="no-card"
        renderItem={(_, index) => <WorkingSkillItemFields index={index} />}
      />

      <ResumeAccordionSection
        title="Knowledge"
        subtitle="Build a quick-glance list of tools, frameworks, and domains you’re confident with."
        items={knowledge}
        addLabel="Add keyword"
        onAdd={() =>
          addKnowledge({
            value: "",
          })
        }
        onRemove={removeKnowledge}
        renderItem={(_, index) => (
          <div className="chip-input-row">
            <div
              className={`chip-input ${
                errors.knowledge?.[index]?.value ? "invalid" : ""
              }`}
            >
              <i className="fa fa-tag" aria-hidden="true"></i>
              <input
                type="text"
                className="chip-field"
                placeholder="Design systems, CI/CD, OKRs…"
                {...register(`knowledge.${index}.value`)}
              />
            </div>
            {errors.knowledge?.[index]?.value ? (
              <div className="invalid-feedback d-block">
                {errors.knowledge?.[index]?.value?.message}
              </div>
            ) : null}
          </div>
        )}
      />

      <ResumeAccordionSection
        title="Languages"
        subtitle="Add languages and proficiency levels."
        items={languages}
        addLabel="Add language"
        onAdd={handleAddLanguage}
        onRemove={handleRemoveLanguage}
        itemClassName="no-card"
        renderItem={(_, index) => <LanguageItemFields index={index} />}
      />

      <div className="text-end mt-4">
        <button type="submit" className="resume-save-btn" disabled={isSaving}>
          <i className="fa fa-save me-2" aria-hidden="true"></i>
          {isSaving ? "Saving..." : isDirty ? "Save Resume" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default ResumeForm;

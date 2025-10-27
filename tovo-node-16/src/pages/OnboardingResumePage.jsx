import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import ProfileStep from "../components/onboarding/ProfileStep";
import ExperienceStep from "../components/onboarding/ExperienceStep";
import EducationStep from "../components/onboarding/EducationStep";
import SkillsStep from "../components/onboarding/SkillsStep";
import ThemeStep from "../components/onboarding/ThemeStep";
import LogoutStep from "../components/onboarding/LogoutStep";
import {
  sanitizeArrayInput,
  formatDateToIso,
  normalizePercentage,
  clampPercentage,
  toMonthInputValue,
} from "../components/onboarding/stepUtils";
import { mergeResumeDefaults } from "../utils/resumeDefaults";
import { mergeThemeDefaults } from "../utils/themePresets";

const STEP_SEQUENCE = ["step_1", "step_2", "step_3", "step_4", "theme", "logout"];

const createEmptyExperience = () => ({
  company: "",
  role: "",
  location: "",
  start_date: "",
  end_date: "",
  current: false,
  description: "",
});

const createEmptyService = () => ({
  title: "",
  description: "",
});

const createEmptyEducation = () => ({
  institution: "",
  degree: "",
  field_of_study: "",
  start_date: "",
  end_date: "",
  notes: "",
  description: "",
});

const createEmptySkill = () => ({
  title: "",
  level: "",
  percentage: 60,
});

const createEmptyLanguage = () => ({
  title: "",
  level: "",
  percentage: 70,
});

const mapKnowledgeToForm = (knowledge = []) => {
  const source =
    Array.isArray(knowledge) && knowledge.length
      ? knowledge
      : [""];
  return source.map((item) => ({
    value: typeof item === "string" ? item : item?.value || "",
  }));
};

const mapKnowledgeToPayload = (knowledge = []) =>
  knowledge
    .map((item) => (item?.value || "").trim())
    .filter((value) => value.length > 0);

const cleanArrayPayload = (items, factory) =>
  (items || [])
    .map((item) => ({
      ...factory(),
      ...(item || {}),
    }))
    .filter((item) =>
      Object.values(item).some((value) =>
        typeof value === "string"
          ? value.trim() !== ""
          : value !== null && value !== undefined
      )
    );

// Next-step navigation disabled; we keep users on their current step

// We only highlight the current step; no completed state tracking

const STEP_CONFIGS = {
  step_1: {
    key: "step_1",
    label: "Profile",
    icon: "fa-user",
    description: "Introduce yourself",
    component: ProfileStep,
    extract: (resume) => ({
      subdomain: resume.subdomain || "",
      avatar: resume.avatar || "",
      profession: resume.profession || "",
      phone: resume.phone || "",
      email: resume.email || "",
      location: resume.location || "",
      facebook: resume.facebook || "",
      linkedin: resume.linkedin || "",
      language_used: resume.language_used || "en",
      include_blogs: Boolean(resume.include_blogs),
      can_download_cv: Boolean(resume.can_download_cv),
      about: {
        short_description: resume?.about?.short_description || "",
        description: resume?.about?.description || "",
      },
    }),
    transform: (values) => ({
      profession: values.profession || "",
      phone: values.phone || "",
      email: values.email || "",
      location: values.location || "",
      facebook: values.facebook || "",
      linkedin: values.linkedin || "",
      language_used: values.language_used || "",
      include_blogs: Boolean(values.include_blogs),
      can_download_cv: Boolean(values.can_download_cv),
      about: {
        short_description: values.about?.short_description || "",
        description: values.about?.description || "",
      },
      ...(values.avatar_upload ? { avatar_upload: values.avatar_upload } : {}),
    }),
  },
  step_2: {
    key: "step_2",
    label: "Experience",
    icon: "fa-briefcase",
    description: "Share your professional story",
    component: ExperienceStep,
    extract: (resume) => ({
      subdomain: resume.subdomain || "",
      experience: sanitizeArrayInput(resume.experience, createEmptyExperience).map(
        (item) => ({
          ...item,
          location: item.location || "",
          start_date: toMonthInputValue(item.start_date),
          end_date: toMonthInputValue(item.end_date),
          current: Boolean(item.current),
        })
      ),
      what_i_do: sanitizeArrayInput(resume.what_i_do, createEmptyService),
    }),
    transform: (values) => ({
      experience: cleanArrayPayload(values.experience, createEmptyExperience).map(
        (item) => {
          const isCurrent = Boolean(item.current);
          return {
            ...item,
            location: item.location || "",
            start_date: formatDateToIso(item.start_date),
            end_date: isCurrent ? null : formatDateToIso(item.end_date),
            current: isCurrent,
          };
        }
      ),
      what_i_do: cleanArrayPayload(values.what_i_do, createEmptyService),
    }),
  },
  step_3: {
    key: "step_3",
    label: "Education",
    icon: "fa-graduation-cap",
    description: "Highlight your learning journey",
    component: EducationStep,
    extract: (resume) => ({
      subdomain: resume.subdomain || "",
      education: sanitizeArrayInput(resume.education, createEmptyEducation).map(
        (item) => ({
          ...item,
          field_of_study: item.field_of_study || "",
          notes: item.notes ?? item.description ?? "",
          start_date: toMonthInputValue(item.start_date),
          end_date: toMonthInputValue(item.end_date),
        })
      ),
    }),
    transform: (values) => ({
      education: cleanArrayPayload(values.education, createEmptyEducation).map(
        (item) => {
          const notes = item.notes ?? item.description ?? "";
          return {
            ...item,
            field_of_study: item.field_of_study || "",
            notes,
            description: notes,
            start_date: formatDateToIso(item.start_date),
            end_date: formatDateToIso(item.end_date),
          };
        }
      ),
    }),
  },
  step_4: {
    key: "step_4",
    label: "Skills",
    icon: "fa-cogs",
    description: "Fine tune the details",
    component: SkillsStep,
    extract: (resume) => ({
      subdomain: resume.subdomain || "",
      working_skills: sanitizeArrayInput(
        resume.working_skills,
        createEmptySkill
      ).map((item) => ({
        ...item,
        percentage: normalizePercentage(item.percentage ?? item.level, 60),
      })),
      knowledge: mapKnowledgeToForm(resume.knowledge),
      languages: sanitizeArrayInput(resume.languages, createEmptyLanguage).map(
        (item) => ({
          ...item,
          level: item.level || "Intermediate",
          percentage: normalizePercentage(item.percentage ?? item.proficiency, 70),
        })
      ),
    }),
    transform: (values) => ({
      working_skills: cleanArrayPayload(
        values.working_skills,
        createEmptySkill
      ).map((item) => ({
        ...item,
        percentage: clampPercentage(item.percentage, 60),
      })),
      knowledge: mapKnowledgeToPayload(values.knowledge),
      languages: cleanArrayPayload(values.languages, createEmptyLanguage).map(
        (item) => ({
          ...item,
          level: item.level || "Intermediate",
          percentage: clampPercentage(item.percentage, 70),
        })
      ),
    }),
  },
  theme: {
    key: "theme",
    label: "Theme",
    icon: "fa-paint-brush",
    description: "Style your resume's look and feel",
    component: ThemeStep,
    extract: (resume) => ({
      ...mergeThemeDefaults(resume),
      subdomain: resume.subdomain || "",
    }),
    transform: (values) => {
      const normalized = mergeThemeDefaults(values);
      return {
        config: {
          theme: normalized.theme,
          layout: normalized.layout,
          features: normalized.features,
          content: normalized.content,
        },
      };
    },
  },
  logout: {
    key: "logout",
    label: "Logout",
    icon: "fa-sign-out",
    description: "Complete your setup",
    component: LogoutStep,
    extract: (resume) => ({
      subdomain: resume.subdomain || "",
    }),
    transform: () => ({}),
  },
};

const buildDraftsFromResume = (resume) => {
  const drafts = {};
  STEP_SEQUENCE.forEach((key) => {
    const config = STEP_CONFIGS[key];
    if (config) {
      drafts[key] = config.extract(resume);
    }
  });
  return drafts;
};

const OnboardingResumePage = () => {
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [resumeData, setResumeData] = useState(null);
  const [currentStepKey, setCurrentStepKey] = useState(STEP_SEQUENCE[0]);
  const [stepDrafts, setStepDrafts] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const loadCurrentResume = useCallback(
    async ({ showLoader = true } = {}) => {
      if (showLoader) {
        setLoading(true);
      }
      setFetchError("");
      try {
        const { data } = await api.get("/api/my-resume");
        const normalizedResume = mergeResumeDefaults(data);
        const drafts = buildDraftsFromResume(normalizedResume);
        setResumeData(normalizedResume);
        setStepDrafts(drafts);
        setCurrentStepKey((previous) =>
          previous && STEP_SEQUENCE.includes(previous)
            ? previous
            : STEP_SEQUENCE[0]
        );
        return {
          resume: normalizedResume,
          completedSteps: new Set(STEP_SEQUENCE),
        };
      } catch (error) {
        const message =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Unable to load your resume progress.";
        setFetchError(message);
        return { error: message };
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    loadCurrentResume();
  }, [loadCurrentResume]);

  const handleStepDraftChange = useCallback((stepKey, values) => {
    setStepDrafts((previous) => ({
      ...previous,
      [stepKey]: values,
    }));
  }, []);

  const handleStepSubmit = useCallback(
    async (stepKey, values, { exitAfterSave = false } = {}) => {
      const config = STEP_CONFIGS[stepKey];
      if (!config) {
        return {
          success: false,
          message: "Unable to locate the requested step.",
        };
      }
      setSubmitting(true);
      setSubmitError("");
      try {
        const payload = {
          ...config.transform(values),
        };
        await api.patch("/api/my-resume", payload);
        setStepDrafts((previous) => ({
          ...previous,
          [stepKey]: values,
        }));
        const result = await loadCurrentResume({ showLoader: false });
        if (result?.error) {
          setSubmitError(result.error);
          return { success: false, message: result.error };
        }
        toast.success("Saved.");
        return { success: true };
      } catch (error) {
        const fieldErrors = error.response?.data;
        const message =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Unable to save your progress.";
        if (
          !fieldErrors ||
          typeof fieldErrors !== "object" ||
          Array.isArray(fieldErrors)
        ) {
          setSubmitError(message);
        }
        return { success: false, fieldErrors, message };
      } finally {
        setSubmitting(false);
      }
    },
    [loadCurrentResume]
  );

  const activeStepConfig = useMemo(() => {
    if (!currentStepKey) {
      return null;
    }
    return STEP_CONFIGS[currentStepKey] || null;
  }, [currentStepKey]);

  const StepComponent = activeStepConfig?.component || null;

  const activeStepDefaults = useMemo(() => {
    if (!activeStepConfig) {
      return null;
    }
    if (stepDrafts[activeStepConfig.key]) {
      return stepDrafts[activeStepConfig.key];
    }
    if (resumeData) {
      return activeStepConfig.extract(resumeData);
    }
    return null;
  }, [activeStepConfig, stepDrafts, resumeData]);

  const handleRetry = () => {
    loadCurrentResume();
  };

  const renderProgress = () => {
    return (
      <ul className="resume-onboarding-progress">
        {STEP_SEQUENCE.map((stepKey, index) => {
          const meta = STEP_CONFIGS[stepKey];
          if (!meta) {
            return null;
          }
          const isActive = currentStepKey === stepKey;
          const status = isActive ? "active" : "upcoming";
          const isInteractive = true;

          const handleSelect = () => {
            setCurrentStepKey(stepKey);
          };

          const handleKeyPress = (event) => {
            if (
              isInteractive &&
              (event.key === "Enter" || event.key === " ")
            ) {
              event.preventDefault();
              setCurrentStepKey(stepKey);
            }
          };

          return (
            <li
              key={stepKey}
              className={`resume-progress-chip ${status}`}
              data-step={stepKey}
              role={isInteractive ? "button" : "presentation"}
              tabIndex={isInteractive ? 0 : -1}
              onClick={handleSelect}
              onKeyPress={handleKeyPress}
            >
              <i className={`fa ${meta.icon} chip-icon`} aria-hidden="true"></i>
              <span className="chip-label d-none d-md-inline">{meta.label}</span>
            </li>
          );
        })}
      </ul>
    );
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
        <h2 className="title text-center d-none d-md-block">
          <span> Build your resume</span>
        </h2>
        <p className="text-center d-none d-md-block">
          We&apos;ll walk you through a few quick steps to get your resume ready.
        </p>
        <div className="resume-card">
          {loading ? (
            <div className="text-center py-5">
              <i
                className="fa fa-spinner fa-pulse fa-3x resume-spinner mb-3"
                aria-hidden="true"
              ></i>
              <p className="mb-0 text-muted">Loading your progress…</p>
            </div>
          ) : fetchError ? (
            <div className="text-center">
              <div className="error-message mb-3">{fetchError}</div>
              <button
                type="button"
                className="resume-save-btn"
                onClick={handleRetry}
              >
                Retry loading
              </button>
            </div>
          ) : !activeStepConfig || !StepComponent || !activeStepDefaults ? (
            <div className="text-center">
              <div className="error-message mb-3">
                We couldn&apos;t determine which step to show. Try refreshing the
                page.
              </div>
              <button
                type="button"
                className="resume-save-btn"
                onClick={handleRetry}
              >
                Refresh
              </button>
            </div>
          ) : (
            <>
              {renderProgress()}
              <header className="mb-4 text-center">
                <h3 className="mb-2 step-title">{activeStepConfig.label}</h3>
                <p className="text-muted mb-0 step-description">
                  {activeStepConfig.description}
                </p>
              </header>
              {submitError ? (
                <div className="error-message text-center mb-3">
                  {submitError}
                </div>
              ) : null}
              <StepComponent
                defaultValues={activeStepDefaults}
                submitting={submitting}
                onChange={(values) =>
                  handleStepDraftChange(activeStepConfig.key, values)
                }
                onNext={(values) =>
                  handleStepSubmit(activeStepConfig.key, values)
                }
                nextLabel={"Save"}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default OnboardingResumePage;

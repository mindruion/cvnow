import { mergeThemeDefaults } from "./themePresets";

export const DEFAULT_RESUME = {
  profession: "",
  phone: "",
  email: "",
  location: "",
  birth_date: "",
  facebook: "",
  linkedin: "",
  avatar: "",
  theme: null,
  layout: {},
  features: {},
  content: {},
  config: {
    theme: null,
    layout: {},
    features: {},
    content: {},
  },
  include_blogs: false,
  can_download_cv: false,
  language_used: "en",
  about: {
    short_description: "",
    description: "",
  },
  what_i_do: [],
  education: [],
  experience: [],
  working_skills: [],
  knowledge: [],
  languages: [],
};

export const mergeResumeDefaults = (resume = {}) => {
  const { config, ...rest } = resume || {};
  const themeSource = {
    ...rest,
    ...(typeof config === "object" ? config : {}),
  };
  const themeDefaults = mergeThemeDefaults(themeSource);

  const merged = {
    ...DEFAULT_RESUME,
    ...rest,
    theme: themeDefaults.theme,
    layout: themeDefaults.layout,
    features: themeDefaults.features,
    content: themeDefaults.content,
  };

  return {
    ...merged,
    config: {
      theme: themeDefaults.theme,
      layout: themeDefaults.layout,
      features: themeDefaults.features,
      content: themeDefaults.content,
    },
    about: (() => {
      const raw = merged.about || {};
      const shortDescription =
        raw.short_description ??
        raw.title ??
        DEFAULT_RESUME.about.short_description;
      return {
        ...DEFAULT_RESUME.about,
        ...raw,
        short_description: shortDescription,
      };
    })(),
    what_i_do: Array.isArray(merged.what_i_do) ? merged.what_i_do : [],
    education: Array.isArray(merged.education) ? merged.education : [],
    experience: Array.isArray(merged.experience) ? merged.experience : [],
    working_skills: Array.isArray(merged.working_skills)
      ? merged.working_skills
      : [],
    knowledge: Array.isArray(merged.knowledge)
      ? merged.knowledge.map((item) =>
          typeof item === "string" ? item : item?.value || ""
        )
      : [],
    languages: Array.isArray(merged.languages) ? merged.languages : [],
  };
};

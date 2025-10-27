const AVAILABLE_THEME_OPTIONS = [
  { id: "bostami", label: "Bostami Classic" },
  { id: "ryancv", label: "RyanCV" },
  { id: "bostami-fusion", label: "Bostami Fusion" },
  { id: "ryancv-fusion", label: "RyanCV Fusion" },
  { id: "custom", label: "Custom Theme" },
];

const deepClone = (value) => JSON.parse(JSON.stringify(value));

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const mergeDeep = (target, source) => {
  if (!isObject(target)) {
    target = {};
  }
  const output = { ...target };
  if (!isObject(source)) {
    return source !== undefined ? source : output;
  }

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = output[key];
    if (Array.isArray(sourceValue)) {
      output[key] = sourceValue.map((item) =>
        isObject(item) ? mergeDeep({}, item) : item
      );
    } else if (isObject(sourceValue)) {
      output[key] = mergeDeep(isObject(targetValue) ? targetValue : {}, sourceValue);
    } else {
      output[key] = sourceValue;
    }
  });

  return output;
};

const createBaseTheme = ({
  id,
  backgroundOverlay,
  modes,
  paletteVariants,
  gradients,
  animations,
}) => ({
  backgroundOverlay,
  id,
  mode: "light",
  availableThemes: AVAILABLE_THEME_OPTIONS,
  modes,
  paletteVariants,
  gradients,
  animations,
});

const BOSTAMI_BASE_THEME = createBaseTheme({
  id: "bostami",
  backgroundOverlay: {
    enabled: true,
    icon: "\u2726",
    color: "secondary",
    density: 120,
    size: 18,
    opacity: 0.14,
    animation: { speed: 22, variance: 16 },
  },
  modes: {
    light: {
      primary: "#FA5252",
      secondary: "#DD2476",
      background: "#F3F6F6",
      surface: "#FFFFFF",
      surfaceMuted: "#F3F6F6",
      surfaceElevation: "#FFFFFF",
      text: "#111111",
      textMuted: "#7B7B7B",
      border: "#E3E3E3",
      emphasis: "#1D1D1D",
    },
    dark: {
      primary: "#FA5252",
      secondary: "#DD2476",
      background: "#111111",
      surface: "#1D1D1D",
      surfaceMuted: "#212425",
      surfaceElevation: "#1D1D1D",
      text: "#FFFFFF",
      textMuted: "#A6A6A6",
      border: "#333333",
      emphasis: "#FAFAFA",
    },
  },
  paletteVariants: [
    "#FFF0F0",
    "#FFF3FC",
    "#E9FAFF",
    "#FFFAE9",
    "#F4F4FF",
    "#FFF0F8",
    "#EEFBFF",
    "#FCF4FF",
    "#F2F4FF",
  ],
  gradients: {
    primary: { angle: 135, stops: ["#FA5252", "#DD2476"] },
    primaryHover: { angle: 135, stops: ["#DD2476", "#FA5252"] },
  },
  animations: {
    preset: "bostami",
    card: {
      initial: { opacity: 0, translateY: 20 },
      animate: { opacity: 1, translateY: 0 },
      transition: { duration: 0.4, ease: "easeOut" },
    },
    section: {
      initial: { opacity: 0, translateY: 40 },
      animate: { opacity: 1, translateY: 0 },
      transition: { duration: 0.6, ease: "easeOut" },
    },
  },
});

const BOSTAMI_BASE_LAYOUT = {
  sidebarPosition: "left",
  showSidebarProfileCard: true,
  showHeaderActions: true,
  enableStickySidebar: true,
  mobileMenuCollapsed: true,
  panels: {
    contact: { visible: true },
    portfolio: { visible: true, displayFilters: true },
  },
};

const BOSTAMI_BASE_FEATURES = {
  allowThemeToggle: true,
  autoApplyConfigTheme: true,
  persistThemeMode: true,
  animations: { enabled: true, preset: "bostami" },
  cvTemplate: "bostami",
  pdfTemplates: [
    { id: "bostami", label: "Bostami Classic" },
    { id: "ryancv", label: "RyanCV" },
    { id: "custom", label: "Custom Theme" },
  ],
};

const BOSTAMI_BASE_CONTENT = {
  hero: {
    greeting: "Hello, I'm",
    headline: "Ion Mindru",
    subtitle: "Full Stack Developer",
    summary:
      "Building responsive web applications with a focus on delightful user interfaces.",
  },
};

const RYAN_BASE_THEME = createBaseTheme({
  id: "ryancv",
  backgroundOverlay: {
    enabled: true,
    icon: "\u25AA",
    color: "primary",
    density: 90,
    size: 14,
    opacity: 0.12,
    animation: { speed: 18, variance: 12 },
  },
  modes: {
    light: {
      primary: "#2563EB",
      secondary: "#14B8A6",
      background: "#EAEEF5",
      surface: "#FFFFFF",
      surfaceMuted: "#F3F4F6",
      surfaceElevation: "#FFFFFF",
      text: "#1E293B",
      textMuted: "#64748B",
      border: "#D1D5DB",
      emphasis: "#0F172A",
    },
    dark: {
      primary: "#38BDF8",
      secondary: "#2563EB",
      background: "#0F172A",
      surface: "#111827",
      surfaceMuted: "#1E293B",
      surfaceElevation: "#111827",
      text: "#E2E8F0",
      textMuted: "#94A3B8",
      border: "#1E293B",
      emphasis: "#F8FAFC",
    },
  },
  paletteVariants: [
    "#E0F2FE",
    "#CCFBF1",
    "#DBEAFE",
    "#D1FAE5",
    "#E2E8F0",
    "#F8FAFC",
    "#DCFCE7",
    "#E0E7FF",
    "#C7D2FE",
  ],
  gradients: {
    primary: { angle: 145, stops: ["#2563EB", "#14B8A6"] },
    primaryHover: { angle: 145, stops: ["#14B8A6", "#2563EB"] },
  },
  animations: {
    preset: "ryancv",
    card: {
      initial: { opacity: 0, translateY: 16 },
      animate: { opacity: 1, translateY: 0 },
      transition: { duration: 0.45, ease: "easeOut" },
    },
    section: {
      initial: { opacity: 0, translateY: 32 },
      animate: { opacity: 1, translateY: 0 },
      transition: { duration: 0.55, ease: "easeOut" },
    },
  },
});

const RYAN_BASE_LAYOUT = {
  sidebarPosition: "right",
  showSidebarProfileCard: false,
  showHeaderActions: true,
  enableStickySidebar: false,
  mobileMenuCollapsed: false,
  panels: {
    contact: { visible: true },
    portfolio: { visible: true, displayFilters: true },
  },
};

const RYAN_BASE_FEATURES = {
  allowThemeToggle: true,
  autoApplyConfigTheme: true,
  persistThemeMode: true,
  animations: { enabled: true, preset: "ryancv" },
  cvTemplate: "ryancv",
  pdfTemplates: [
    { id: "ryancv", label: "RyanCV" },
    { id: "bostami", label: "Bostami Classic" },
    { id: "custom", label: "Custom Theme" },
  ],
};

const RYAN_BASE_CONTENT = {
  hero: {
    greeting: "Hey there, I'm",
    headline: "Alex Rivera",
    subtitle: "Product Designer",
    summary:
      "Crafting human-centered experiences with a balance of visual polish and usability.",
  },
};

const applyPresetMode = (base, { id, mode, overrides = {} }) => {
  const clone = deepClone(base);
  clone.theme.id = id;
  clone.theme.mode = mode;
  clone.theme.availableThemes = AVAILABLE_THEME_OPTIONS;
  return mergeDeep(clone, overrides);
};

const BOSTAMI_LIGHT = applyPresetMode(
  {
    theme: BOSTAMI_BASE_THEME,
    layout: BOSTAMI_BASE_LAYOUT,
    features: BOSTAMI_BASE_FEATURES,
    content: BOSTAMI_BASE_CONTENT,
  },
  { id: "bostami", mode: "light" }
);

const BOSTAMI_DARK = applyPresetMode(
  {
    theme: BOSTAMI_BASE_THEME,
    layout: BOSTAMI_BASE_LAYOUT,
    features: BOSTAMI_BASE_FEATURES,
    content: BOSTAMI_BASE_CONTENT,
  },
  { id: "bostami", mode: "dark" }
);

const RYAN_LIGHT = applyPresetMode(
  {
    theme: RYAN_BASE_THEME,
    layout: RYAN_BASE_LAYOUT,
    features: RYAN_BASE_FEATURES,
    content: RYAN_BASE_CONTENT,
  },
  { id: "ryancv", mode: "light" }
);

const RYAN_DARK = applyPresetMode(
  {
    theme: RYAN_BASE_THEME,
    layout: RYAN_BASE_LAYOUT,
    features: RYAN_BASE_FEATURES,
    content: RYAN_BASE_CONTENT,
  },
  { id: "ryancv", mode: "dark" }
);

const BOSTAMI_FUSION_LIGHT = applyPresetMode(
  {
    theme: BOSTAMI_BASE_THEME,
    layout: mergeDeep(BOSTAMI_BASE_LAYOUT, {
      sidebarPosition: "left",
      enableStickySidebar: true,
      panels: {
        portfolio: { displayFilters: true },
      },
    }),
    features: mergeDeep(BOSTAMI_BASE_FEATURES, {
      animations: { preset: "fusion" },
      cvTemplate: "bostami",
    }),
    content: mergeDeep(BOSTAMI_BASE_CONTENT, {
      hero: {
        subtitle: "Fusion UI Engineer",
        summary:
          "Blending bold gradients with refined composition for portfolios that stand out.",
      },
    }),
  },
  {
    id: "bostami-fusion",
    mode: "light",
    overrides: {
      theme: {
        modes: {
          light: mergeDeep(BOSTAMI_BASE_THEME.modes.light, {
            background: RYAN_BASE_THEME.modes.dark.background,
            surface: RYAN_BASE_THEME.modes.dark.surface,
            surfaceMuted: RYAN_BASE_THEME.modes.light.surfaceMuted,
            surfaceElevation: RYAN_BASE_THEME.modes.dark.surfaceElevation,
            text: RYAN_BASE_THEME.modes.dark.text,
            textMuted: RYAN_BASE_THEME.modes.dark.textMuted,
            border: RYAN_BASE_THEME.modes.light.border,
            emphasis: RYAN_BASE_THEME.modes.dark.emphasis,
          }),
        },
        animations: { preset: "fusion" },
      },
    },
  }
);

const BOSTAMI_FUSION_DARK = applyPresetMode(BOSTAMI_FUSION_LIGHT, {
  id: "bostami-fusion",
  mode: "dark",
  overrides: {
    theme: {
      modes: {
        dark: mergeDeep(BOSTAMI_BASE_THEME.modes.dark, {
          background: RYAN_BASE_THEME.modes.dark.background,
          surface: RYAN_BASE_THEME.modes.dark.surface,
          surfaceMuted: RYAN_BASE_THEME.modes.dark.surfaceMuted,
          surfaceElevation: RYAN_BASE_THEME.modes.dark.surfaceElevation,
          text: RYAN_BASE_THEME.modes.dark.text,
          textMuted: RYAN_BASE_THEME.modes.dark.textMuted,
          border: RYAN_BASE_THEME.modes.dark.border,
          emphasis: RYAN_BASE_THEME.modes.dark.emphasis,
        }),
      },
    },
  },
});

const RYAN_FUSION_LIGHT = applyPresetMode(
  {
    theme: RYAN_BASE_THEME,
    layout: mergeDeep(RYAN_BASE_LAYOUT, {
      sidebarPosition: "right",
      showSidebarProfileCard: true,
      enableStickySidebar: true,
    }),
    features: mergeDeep(RYAN_BASE_FEATURES, {
      animations: { preset: "fusion" },
      cvTemplate: "ryancv",
    }),
    content: mergeDeep(RYAN_BASE_CONTENT, {
      hero: {
        headline: "Morgan Lee",
        subtitle: "Creative Technologist",
        summary:
          "Pairing structured layouts with energetic gradients for expressive resumes.",
      },
    }),
  },
  {
    id: "ryancv-fusion",
    mode: "light",
    overrides: {
      theme: {
        modes: {
          light: mergeDeep(RYAN_BASE_THEME.modes.light, {
            primary: BOSTAMI_BASE_THEME.modes.light.primary,
            secondary: BOSTAMI_BASE_THEME.modes.light.secondary,
          }),
          dark: mergeDeep(RYAN_BASE_THEME.modes.dark, {
            primary: BOSTAMI_BASE_THEME.modes.dark.primary,
            secondary: BOSTAMI_BASE_THEME.modes.dark.secondary,
          }),
        },
        gradients: deepClone(BOSTAMI_BASE_THEME.gradients),
        paletteVariants: deepClone(BOSTAMI_BASE_THEME.paletteVariants),
        animations: { preset: "fusion" },
      },
    },
  }
);

const RYAN_FUSION_DARK = applyPresetMode(RYAN_FUSION_LIGHT, {
  id: "ryancv-fusion",
  mode: "dark",
});

const THEME_PRESETS = {
  bostami: {
    id: "bostami",
    label: "Bostami Classic",
    description: "Vibrant gradients with playful overlays and upbeat motion.",
    modes: {
      light: BOSTAMI_LIGHT,
      dark: BOSTAMI_DARK,
    },
  },
  ryancv: {
    id: "ryancv",
    label: "RyanCV",
    description: "Structured elegance with crisp contrasts and professional tone.",
    modes: {
      light: RYAN_LIGHT,
      dark: RYAN_DARK,
    },
  },
  "bostami-fusion": {
    id: "bostami-fusion",
    label: "Bostami Fusion",
    description:
      "Bold Bostami gradients meet RyanCV's sophisticated surfaces for dramatic depth.",
    modes: {
      light: BOSTAMI_FUSION_LIGHT,
      dark: BOSTAMI_FUSION_DARK,
    },
  },
  "ryancv-fusion": {
    id: "ryancv-fusion",
    label: "RyanCV Fusion",
    description:
      "RyanCV structure infused with Bostami color energy for a modern hybrid look.",
    modes: {
      light: RYAN_FUSION_LIGHT,
      dark: RYAN_FUSION_DARK,
    },
  },
};

const clonePresetConfig = (id, mode = "light") => {
  const preset = THEME_PRESETS[id];
  if (!preset) {
    return null;
  }
  const variant = preset.modes[mode];
  if (!variant) {
    return null;
  }
  const cloned = deepClone(variant);
  // Ensure the theme ID is set correctly
  cloned.theme.id = id;
  return cloned;
};

const mergeThemeDefaults = (source = {}) => {
  const base = clonePresetConfig("bostami", "light");
  if (!base) {
    return {
      theme: {},
      layout: {},
      features: {},
      content: {},
    };
  }

  let workingSource = source;

  const extractConfig = (input) =>
    isObject(input?.config) ? input.config : null;

  const rootConfig = extractConfig(source);

  if (rootConfig) {
    workingSource = {
      ...source,
      ...rootConfig,
    };
  }

  const legacyMode =
    typeof workingSource?.theme === "string" ? workingSource.theme : null;

  const sanitizedSource = { ...workingSource };
  if (legacyMode) {
    sanitizedSource.theme = { mode: legacyMode };
  }

  const merged = mergeDeep(base, sanitizedSource);

  if (!merged.theme.availableThemes || !merged.theme.availableThemes.length) {
    merged.theme.availableThemes = AVAILABLE_THEME_OPTIONS;
  }

  if (!merged.theme.id) {
    merged.theme.id = "bostami";
  }

  if (legacyMode) {
    merged.theme.mode = legacyMode === "dark" ? "dark" : "light";
  }

  merged.theme.mode = merged.theme.mode === "dark" ? "dark" : "light";

  const configProjection = {
    theme: merged.theme,
    layout: merged.layout,
    features: merged.features,
    content: merged.content,
  };

  return {
    ...configProjection,
    config: configProjection,
  };
};

const DEFAULT_THEME_STATE = mergeThemeDefaults();

export {
  AVAILABLE_THEME_OPTIONS,
  THEME_PRESETS,
  clonePresetConfig as getPresetConfig,
  mergeThemeDefaults,
  DEFAULT_THEME_STATE,
  deepClone,
};

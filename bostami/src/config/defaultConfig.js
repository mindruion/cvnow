export const defaultTheme = {
  id: "bostami",
  mode: "light",
  availableThemes: [
    { id: "bostami", label: "Bostami Classic" },
    { id: "ryancv", label: "RyanCV" },
  ],
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
  gradients: {
    primary: {
      angle: 135,
      stops: ["#FA5252", "#DD2476"],
    },
    primaryHover: {
      angle: 135,
      stops: ["#DD2476", "#FA5252"],
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
  backgroundOverlay: {
    enabled: true,
    icon: "•",
    color: "primary",
    density: 80,
    size: 14,
    opacity: 0.12,
    blendMode: "screen",
    animation: {
      speed: 18,
      variance: 12,
    },
  },
};

export const defaultLayout = {
  sidebarPosition: "left",
  showSidebarProfileCard: true,
  showHeaderActions: true,
  enableStickySidebar: true,
  mobileMenuCollapsed: true,
  panels: {
    contact: {
      visible: true,
    },
    portfolio: {
      visible: true,
      displayFilters: true,
    },
  },
};

export const defaultFeatures = {
  allowThemeToggle: true,
  autoApplyConfigTheme: true,
  persistThemeMode: true,
  animations: {
    enabled: true,
    preset: "bostami",
  },
  cvTemplate: "bostami",
  pdfTemplates: [
    { id: "bostami", label: "Bostami Classic" },
    { id: "ryancv", label: "RyanCV" },
    { id: "custom", label: "Custom Theme" },
  ],
};

export const defaultConfig = {
  theme: defaultTheme,
  layout: defaultLayout,
  features: defaultFeatures,
};

export const THEME_STORAGE_KEY = "app-theme-mode";

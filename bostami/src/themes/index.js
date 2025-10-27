import { defaultTheme, defaultLayout, defaultFeatures } from "../config/defaultConfig";

const clone = (value) => JSON.parse(JSON.stringify(value));

const bostamiTheme = {
  id: "bostami",
  label: "Bostami Classic",
  theme: clone(defaultTheme),
  layout: clone(defaultLayout),
  features: clone(defaultFeatures),
  meta: {
    appComponent: "bostami",
  },
};

const ryancvBaseTheme = {
  id: "ryancv",
  mode: "light",
  availableThemes: [
    { id: "bostami", label: "Bostami Classic" },
    { id: "ryancv", label: "RyanCV" },
  ],
  modes: {
    light: {
      primary: "#FF4C60",
      secondary: "#4ACCF7",
      background: "#0B0C10",
      surface: "#11151C",
      surfaceMuted: "#1F2833",
      surfaceElevation: "#1B1F29",
      text: "#F5F5F5",
      textMuted: "#A0A8B5",
      border: "#2E3442",
      emphasis: "#FFFFFF",
    },
    dark: {
      primary: "#FF4C60",
      secondary: "#4ACCF7",
      background: "#050608",
      surface: "#0E1117",
      surfaceMuted: "#1B202C",
      surfaceElevation: "#121621",
      text: "#EAEAEA",
      textMuted: "#9399A6",
      border: "#2E3442",
      emphasis: "#FFFFFF",
    },
  },
  gradients: {
    primary: {
      angle: 145,
      stops: ["#FF4C60", "#9F2FFF"],
    },
    primaryHover: {
      angle: 145,
      stops: ["#9F2FFF", "#FF4C60"],
    },
  },
  paletteVariants: [
    "#FFEDF1",
    "#E5F7FF",
    "#161B24",
    "#1E2532",
    "#242C3C",
    "#3A2B47",
    "#151925",
    "#4ACCF7",
    "#FFB66D",
  ],
  animations: {
    preset: "ryancv",
    card: {
      initial: { opacity: 0, rotateX: -45 },
      animate: { opacity: 1, rotateX: 0 },
      transition: { duration: 0.5, ease: "easeOut" },
    },
    section: {
      initial: { opacity: 0, translateY: 60, scale: 0.96 },
      animate: { opacity: 1, translateY: 0, scale: 1 },
      transition: { duration: 0.7, ease: "easeOut" },
    },
  },
};

const ryancvLayout = {
  sidebarPosition: "left",
  showSidebarProfileCard: false,
  showHeaderActions: false,
  enableStickySidebar: false,
  mobileMenuCollapsed: true,
  panels: {
    contact: { visible: true },
    portfolio: { visible: true, displayFilters: false },
  },
};

const ryancvFeatures = {
  allowThemeToggle: true,
  autoApplyConfigTheme: true,
  persistThemeMode: true,
  animations: {
    enabled: true,
    preset: "ryancv",
  },
  cvTemplate: "ryancv",
  pdfTemplates: [
    { id: "bostami", label: "Bostami Classic" },
    { id: "ryancv", label: "RyanCV" },
    { id: "custom", label: "Custom Theme" },
  ],
};

const ryancvTheme = {
  id: "ryancv",
  label: "RyanCV",
  theme: ryancvBaseTheme,
  layout: ryancvLayout,
  features: ryancvFeatures,
  meta: {
    appComponent: "ryancv",
  },
};

export const THEMES = {
  bostami: bostamiTheme,
  ryancv: ryancvTheme,
};

export const getThemeDefinition = (id = "bostami") =>
  THEMES[id] || THEMES.bostami;

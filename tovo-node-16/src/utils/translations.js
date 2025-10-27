// Translation keys for ThemeStep component
export const themeStepTranslations = {
  // Main headings
  themeAndPolish: "Theme & Polish",
  presetThemes: "Preset Themes", 
  livePreview: "Live Preview",
  advancedConfiguration: "Advanced Configuration",
  
  // Helper text
  themeDescription: "Pick a preset or fine-tune the colours, layout, and motion for your resume.",
  presetDescription: "Start from a curated look. You can still tweak settings afterwards.",
  previewDescription: "Preview updates instantly using your current selections.",
  advancedDescription: "Switch to the custom theme to unlock detailed colour, layout, and motion controls.",
  
  // Section headings
  coloursAndPalette: "Colours & Palette",
  backgroundOverlay: "Background Overlay", 
  motionSettings: "Motion Settings",
  layoutPreferences: "Layout Preferences",
  featureFlags: "Feature Flags",
  heroContent: "Hero Content",
  
  // Helper text for sections
  coloursDescription: "Customize your theme's colour palette and gradients.",
  overlayDescription: "Control overlay density, iconography, and animation for added depth.",
  motionDescription: "Fine-tune how cards and sections animate into view.",
  layoutDescription: "Control sidebar placement and which panels appear on your profile.",
  featuresDescription: "Configure theme toggles, automation, and export options.",
  heroDescription: "Update the primary text shown alongside your theme preview.",
  
  // Button labels
  hideAdvanced: "Hide Advanced",
  showAdvanced: "Show Advanced",
  useCustomTheme: "Use Custom Theme",
  
  // Mode labels
  light: "Light",
  dark: "Dark",
  
  // Form labels
  greeting: "Greeting",
  headline: "Headline", 
  subtitle: "Subtitle",
  summary: "Summary",
  
  // Placeholders
  greetingPlaceholder: "Hello, I'm",
  headlinePlaceholder: "Ion Mindru",
  subtitlePlaceholder: "Full Stack Developer", 
  summaryPlaceholder: "Share a quick summary...",
  customThemeSettings: "Custom Theme Settings",
  customThemeDescription: "Configure colors, layout, and advanced options for your custom theme.",
};

// Simple translation function
export const t = (key) => {
  return themeStepTranslations[key] || key;
};

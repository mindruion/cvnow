import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  AVAILABLE_THEME_OPTIONS,
  THEME_PRESETS,
  deepClone,
  getPresetConfig,
  mergeThemeDefaults,
} from "../../utils/themePresets";
import { applyServerErrors } from "./stepUtils";
import { t } from "../../utils/translations";
import analytics from "../../utils/analytics";
import { setupMobileResponsive } from "../../utils/mobileResponsive";
import ModeSegmented from "../shared/ModeSegmented";
import CustomThemeCTA from "../shared/CustomThemeCTA";
import Accordion from "../shared/Accordion";
import TokenRow from "../shared/TokenRow";
import DirtySaveBar from "../shared/DirtySaveBar";
import SkeletonCard from "../shared/SkeletonCard";
import InlineError from "../shared/InlineError";
import PreviewButton from "../shared/PreviewButton";
import Callout from "../shared/Callout";

// Custom useId hook for React 17 compatibility (React 18+ has built-in useId)
let idCounter = 0;
const useId = () => {
  const idRef = useRef(null);
  if (idRef.current === null) {
    idRef.current = `:id-${idCounter++}`;
  }
  return idRef.current;
};

const MODE_COLOR_FIELDS = [
  { key: "primary", label: "Primary" },
  { key: "secondary", label: "Secondary" },
  { key: "background", label: "Background" },
  { key: "surface", label: "Surface" },
  { key: "surfaceMuted", label: "Muted surface" },
  { key: "surfaceElevation", label: "Surface elevation" },
  { key: "text", label: "Body text" },
  { key: "textMuted", label: "Muted text" },
  { key: "border", label: "Border" },
  { key: "emphasis", label: "Emphasis" },
];

// Sample palette data for color tokens
const SAMPLE_PALETTES = {
  primary: ["#0f8a9c", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7"],
  secondary: ["#64748b", "#6b7280", "#9ca3af", "#d1d5db", "#e5e7eb", "#f3f4f6"],
  accent: ["#f59e0b", "#f97316", "#ef4444", "#ec4899", "#8b5cf6", "#06b6d4"],
  surface: ["#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", "#cbd5e1", "#94a3b8"],
};

const CHIP_GROUP_STYLE = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
};

const RESPONSIVE_GRID_TEMPLATE = "repeat(auto-fit, minmax(min(240px, 100%), 1fr))";

const HEX_COLOR_PATTERN =
  /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

const toColorInputValue = (value, fallback = "#000000") => {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return HEX_COLOR_PATTERN.test(trimmed) ? trimmed : fallback;
};

const gradientSchema = yup.object({
  angle: yup
    .number()
    .typeError("Angle must be numeric.")
    .min(0)
    .max(360)
    .default(135),
  stops: yup
    .array()
    .of(yup.string().trim().required("Gradient stop is required."))
    .min(2)
    .default(["#000000", "#FFFFFF"]),
});

const themeSchema = yup.object({
  theme: yup.object({
    id: yup.string().required("Select a theme preset."),
    mode: yup.string().oneOf(["light", "dark"]).required("Choose a mode."),
    backgroundOverlay: yup.object({
      enabled: yup.boolean().default(true),
      icon: yup.string().default(""),
      color: yup.string().default("secondary"),
      density: yup
        .number()
        .typeError("Density must be numeric.")
        .min(0)
        .max(300)
        .default(120),
      size: yup
        .number()
        .typeError("Size must be numeric.")
        .min(0)
        .max(200)
        .default(18),
      opacity: yup
        .number()
        .typeError("Opacity must be numeric.")
        .min(0)
        .max(1)
        .default(0.14),
      animation: yup.object({
        speed: yup
          .number()
          .typeError("Speed must be numeric.")
          .min(0)
          .max(200)
          .default(22),
        variance: yup
          .number()
          .typeError("Variance must be numeric.")
          .min(0)
          .max(200)
          .default(16),
      }),
    }),
    modes: yup.object({
      light: yup.object().shape(
        MODE_COLOR_FIELDS.reduce(
          (shape, field) => ({
            ...shape,
            [field.key]: yup.string().trim().required(`${field.label} is required.`),
          }),
          {}
        )
      ),
      dark: yup.object().shape(
        MODE_COLOR_FIELDS.reduce(
          (shape, field) => ({
            ...shape,
            [field.key]: yup.string().trim().required(`${field.label} is required.`),
          }),
          {}
        )
      ),
    }),
    paletteVariants: yup
      .array()
      .of(yup.string().trim().required("Palette colour is required."))
      .default([]),
    gradients: yup.object({
      primary: gradientSchema,
      primaryHover: gradientSchema,
    }),
    animations: yup.object({
      preset: yup.string().default("bostami"),
      card: yup.object({
        initial: yup.object({
          opacity: yup.number().typeError("Opacity must be numeric.").default(0),
          translateY: yup.number().typeError("TranslateY must be numeric.").default(20),
        }),
        animate: yup.object({
          opacity: yup.number().typeError("Opacity must be numeric.").default(1),
          translateY: yup.number().typeError("TranslateY must be numeric.").default(0),
        }),
        transition: yup.object({
          duration: yup
            .number()
            .typeError("Duration must be numeric.")
            .default(0.4),
          ease: yup.string().default("easeOut"),
        }),
      }),
      section: yup.object({
        initial: yup.object({
          opacity: yup.number().typeError("Opacity must be numeric.").default(0),
          translateY: yup.number().typeError("TranslateY must be numeric.").default(40),
        }),
        animate: yup.object({
          opacity: yup.number().typeError("Opacity must be numeric.").default(1),
          translateY: yup.number().typeError("TranslateY must be numeric.").default(0),
        }),
        transition: yup.object({
          duration: yup
            .number()
            .typeError("Duration must be numeric.")
            .default(0.6),
          ease: yup.string().default("easeOut"),
        }),
      }),
    }),
  }),
  layout: yup.object({
    sidebarPosition: yup.string().oneOf(["left", "right"]).required(),
    showSidebarProfileCard: yup.boolean(),
    showHeaderActions: yup.boolean(),
    enableStickySidebar: yup.boolean(),
    mobileMenuCollapsed: yup.boolean(),
    panels: yup.object({
      contact: yup.object({
        visible: yup.boolean(),
      }),
      portfolio: yup.object({
        visible: yup.boolean(),
        displayFilters: yup.boolean(),
      }),
    }),
  }),
  features: yup.object({
    allowThemeToggle: yup.boolean(),
    autoApplyConfigTheme: yup.boolean(),
    persistThemeMode: yup.boolean(),
    animations: yup.object({
      enabled: yup.boolean(),
      preset: yup.string().default("bostami"),
    }),
    cvTemplate: yup.string().default("bostami"),
    pdfTemplates: yup
      .array()
      .of(
        yup.object({
          id: yup.string().trim().required("Template id is required."),
          label: yup.string().trim().required("Template label is required."),
        })
      )
      .default([]),
  }),
  content: yup.object({
    hero: yup.object({
      greeting: yup.string().trim().required("Greeting is required."),
      headline: yup.string().trim().required("Headline is required."),
      subtitle: yup.string().trim().required("Subtitle is required."),
      summary: yup.string().trim().required("Summary is required."),
    }),
  }),
});

const ThemePresetCard = ({
  preset,
  selected,
  onSelectPreset,
  disabled,
  preview,
  currentMode,
  index,
  totalCount,
  activeIndex,
  className = "",
}) => {
  const variantPreview =
    preview?.[currentMode] || preview?.light || preview?.dark || null;
  const palette = variantPreview?.theme?.modes?.[currentMode];
  const gradient = variantPreview?.theme?.gradients?.primary;
  const previewStyle = gradient
    ? {
        background: `linear-gradient(${gradient.angle}deg, ${gradient.stops.join(
          ", "
        )})`,
        color: palette?.text || "#111111",
      }
    : {
        background: palette?.background || "#F3F6F6",
        color: palette?.text || "#111111",
      };

  const handleCardClick = () => {
    if (!disabled) {
      onSelectPreset();
    }
  };

  return (
    <button
      type="button"
      className={`card inner-card theme-preset-card theme-carousel-card ${
        selected ? "active theme-card-selected" : ""
      } ${disabled ? "disabled" : ""} ${className}`}
      role="option"
      aria-selected={selected}
      aria-posinset={index + 1}
      aria-setsize={totalCount}
      tabIndex={index === activeIndex ? 0 : -1}
      aria-label={`${preset.label} theme preset`}
      aria-disabled={disabled ? "true" : undefined}
      style={{
        height: "100%",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        border: "none",
        padding: 0,
        background: "inherit",
        appearance: "none",
        WebkitAppearance: "none",
        width: "100%",
      }}
      onClick={handleCardClick}
      disabled={disabled}
    >
      {selected && (
        <div className="theme-preset-check-badge" aria-hidden="true">
          <i className="fa fa-check" aria-hidden="true"></i>
        </div>
      )}

      <div
        className="theme-preset-preview theme-preview-area"
        style={previewStyle}
      >
        <div className="theme-preset-preview-overlay">
          <span className="theme-preset-label">{preset.label}</span>
        </div>
      </div>
      <div className="theme-card-text">
        <h5 title={preset.label}>{preset.label}</h5>
        <p className="theme-card-description text-muted" title={preset.description}>{preset.description}</p>
      </div>
    </button>
  );
};

const CustomThemeCard = ({
  active,
  currentMode,
  onSelect,
  disabled,
  preview,
  index,
  totalCount,
  activeIndex,
  className = "",
}) => {
  const palette = preview?.theme?.modes?.[currentMode];
  const gradient = preview?.theme?.gradients?.primary;
  const previewStyle = gradient
    ? {
        background: `linear-gradient(${gradient.angle}deg, ${gradient.stops.join(
          ", "
        )})`,
        color: palette?.text || "#111111",
      }
    : {
        background: palette?.background || "#F3F6F6",
        color: palette?.text || "#111111",
      };

  const handleClick = () => {
    if (!disabled) {
      onSelect();
    }
  };

  return (
    <button
      type="button"
      className={`card inner-card custom-theme-card theme-carousel-card ${
        active ? "active theme-card-selected" : ""
      } ${disabled ? "disabled" : ""} ${className}`}
      role="option"
      aria-selected={active}
      aria-posinset={index + 1}
      aria-setsize={totalCount}
      tabIndex={index === activeIndex ? 0 : -1}
      aria-label="Custom theme preset"
      aria-disabled={disabled ? "true" : undefined}
      style={{
        height: "100%",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        border: "none",
        padding: 0,
        background: "inherit",
        appearance: "none",
        WebkitAppearance: "none",
        width: "100%",
      }}
      onClick={handleClick}
      disabled={disabled}
    >
      {active && (
        <div className="theme-preset-check-badge" aria-hidden="true">
          <i className="fa fa-check" aria-hidden="true"></i>
        </div>
      )}

      <div
        className="theme-preset-preview theme-preview-area"
        style={previewStyle}
      >
        <div className="theme-preset-preview-overlay">
          <span className="theme-preset-label">Custom Theme</span>
        </div>
      </div>
      <div
        className="theme-card-text"
      >
        <h5 title="Custom Theme">Custom Theme</h5>
        <p className="theme-card-description text-muted">
          Build your own palette, gradients, and layout preferences from scratch.
        </p>
        <p className="theme-card-description text-muted">
          Currently in <strong>{currentMode === "dark" ? "Dark" : "Light"}</strong> mode.
        </p>
      </div>
    </button>
  );
};

const ThemeStep = ({
  defaultValues,
  onNext,
  submitting,
  onChange,
  nextLabel = "Save",
}) => {
  const sanitizedDefaults = useMemo(
    () => mergeThemeDefaults(defaultValues),
    [defaultValues]
  );

  const initialIsCustom = sanitizedDefaults?.theme?.id === "custom";

  const [serverError, setServerError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(initialIsCustom);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [themeError, setThemeError] = useState(null);

  const isResettingRef = useRef(false);
  const resetTimerRef = useRef(null);
  const lastDefaultsRef = useRef("");
  const previousIsCustomRef = useRef(initialIsCustom);

  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    getValues,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(themeSchema),
    defaultValues: sanitizedDefaults,
    mode: "onBlur",
  });

  useEffect(() => {
    const snapshot = JSON.stringify(sanitizedDefaults);
    if (snapshot !== lastDefaultsRef.current) {
      const currentSnapshot = JSON.stringify(getValues());
      if (currentSnapshot !== snapshot) {
        isResettingRef.current = true;
        reset(sanitizedDefaults);
        resetTimerRef.current = setTimeout(() => {
          isResettingRef.current = false;
        }, 0);
      } else {
        isResettingRef.current = false;
      }
      lastDefaultsRef.current = snapshot;
      if (sanitizedDefaults?.theme?.id === "custom") {
        setShowAdvanced(true);
      }
    }
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
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

  // Setup mobile responsive handling
  useEffect(() => {
    const cleanup = setupMobileResponsive();
    return cleanup;
  }, []);

  const themeId = watch("theme.id");
  const themeMode = watch("theme.mode");
  const themeState = watch("theme");
  const layoutState = watch("layout");
  const contentState = watch("content");
  const paletteValues = watch("theme.paletteVariants") || [];
  const pdfTemplates = watch("features.pdfTemplates") || [];
  const gradientsState = watch("theme.gradients") || {};
  const isCustomTheme = themeId === "custom";
  const isAdvancedDisabled = !isCustomTheme;

  // Handle color token selection
  const handleColorTokenSelect = (tokenType, color) => {
    const fieldName = `theme.modes.${themeMode}.${tokenType}`;
    setValue(fieldName, color, { shouldDirty: true });
    
    // Track analytics for custom color changes
    analytics.onCustomColorChange(tokenType, color, {
      themeId: themeId,
      mode: themeMode,
      previousColor: watch(fieldName)
    });
  };

  // Handle form reset
  const handleReset = () => {
    // Track analytics for reset
    analytics.onReset({
      previousThemeId: themeId,
      previousMode: themeMode,
      hadCustomizations: isDirty
    });
    
    reset(sanitizedDefaults);
    setServerError("");
  };

  // Handle custom theme CTA clicks with analytics
  const handleCustomThemeCTA = (location) => {
    // Track analytics for CTA clicks
    analytics.onCustomThemeCTA(location, {
      themeId: themeId,
      mode: themeMode,
      isDirty: isDirty
    });
    
    // Call the original handler
    handleCustomSelect();
  };

  // Handle refetch for error recovery
  const handleRefetch = () => {
    setThemeError(null);
    setLoading(true);
    // Simulate refetch - in real app this would call an API
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Get theme presets data
  const themePresetsData = Object.values(THEME_PRESETS);

  useEffect(() => {
    if (!isCustomTheme && showAdvanced) {
      setShowAdvanced(false);
    }
    if (isCustomTheme && !previousIsCustomRef.current) {
      setShowAdvanced(true);
    }
    previousIsCustomRef.current = isCustomTheme;
  }, [isCustomTheme, showAdvanced]);

  // Sync activeIndex with current selection
  useEffect(() => {
    if (themeId === "custom") {
      setActiveIndex(themePresetsData.length);
    } else {
      const presetIndex = themePresetsData.findIndex(preset => preset.id === themeId);
      if (presetIndex !== -1) {
        setActiveIndex(presetIndex);
      }
    }
  }, [themeId, themePresetsData]);

  const presetPreviewMap = useMemo(() => {
    const map = {};
    themePresetsData.forEach((preset) => {
      map[preset.id] = {
        light: getPresetConfig(preset.id, "light"),
        dark: getPresetConfig(preset.id, "dark"),
      };
    });
    return map;
  }, [themePresetsData]);

  const livePreview = useMemo(
    () =>
      mergeThemeDefaults({
        theme: deepClone(themeState || {}),
        layout: layoutState,
        content: contentState,
      }),
    [themeState, layoutState, contentState]
  );

  const activePalette = themeState?.modes?.[themeMode] || {};

  const applyPreset = (presetId, mode) => {
    const config = getPresetConfig(presetId, mode);
    if (!config) {
      return;
    }
    
    // Track analytics for preset selection
    analytics.onPresetSelect(presetId, mode, {
      previousThemeId: themeId,
      previousMode: themeMode
    });
    
    const normalized = mergeThemeDefaults(config);
    isResettingRef.current = true;
    reset(normalized);
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = setTimeout(() => {
      isResettingRef.current = false;
    }, 0);
    setServerError("");
    if (onChange) {
      onChange(normalized);
    }
    setShowAdvanced(false);
  };

  const handlePresetSelect = (presetId, mode) => {
    applyPreset(presetId, mode);
  };

  const handleCustomSelect = () => {
    const currentValues = getValues();
    setValue("theme.id", "custom", { shouldDirty: true });
    if (!currentValues.theme?.availableThemes?.length) {
      setValue("theme.availableThemes", AVAILABLE_THEME_OPTIONS, {
        shouldDirty: true,
      });
    }
    setShowAdvanced(true);
    
    // Track analytics for custom theme selection
    analytics.onThemeSelect('custom', {
      previousThemeId: themeId,
      mode: themeMode,
      source: 'custom_theme_cta'
    });
    
    // Scroll to advanced config section
    setTimeout(() => {
      const advancedConfigElement = document.getElementById('advanced-config');
      if (advancedConfigElement) {
        advancedConfigElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  const handleModeChange = (mode) => {
    if (themeId && themeId !== "custom") {
      applyPreset(themeId, mode);
      return;
    }
    
    // Track analytics for mode change
    analytics.onModeChange(mode, {
      themeId: themeId,
      previousMode: themeMode
    });
    
    setValue("theme.mode", mode, { shouldDirty: true });
  };

  const handlePresetListKeyDown = (event) => {
    const totalOptions = themePresetsData.length + 1; // +1 for custom theme
    
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalOptions - 1));
        break;
        
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((prev) => (prev < totalOptions - 1 ? prev + 1 : 0));
        break;
        
      case "Enter":
      case " ":
        event.preventDefault();
        if (activeIndex < themePresetsData.length) {
          const preset = themePresetsData[activeIndex];
          handlePresetSelect(preset.id, themeMode);
        } else {
          handleCustomSelect();
        }
        break;
        
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
        
      case "End":
        event.preventDefault();
        setActiveIndex(totalOptions - 1);
        break;
        
      default:
        break;
    }
  };

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
    // Track analytics for theme save
    const tokensChanged = isDirty && themeId === 'custom';
    analytics.onSave(themeId, themeMode, tokensChanged, {
      hasCustomizations: isDirty,
      customTokens: tokensChanged ? Object.keys(values.theme?.modes?.[themeMode] || {}) : [],
      formValues: values
    });
    
    const result = await onNext(values);
    handleServerResponse(result);
  };

  const renderColorField = (modeKey, field) => {
    const fieldName = `theme.modes.${modeKey}.${field.key}`;
    const value = watch(fieldName);
    const colorValue = toColorInputValue(value, "#FA5252");
    const error =
      errors?.theme?.modes?.[modeKey]?.[field.key]?.message || null;
    return (
      <div className="form-group" key={`${modeKey}-${field.key}`}>
        <label className="form-label d-flex justify-content-between align-items-center">
          <span>{field.label}</span>
          <span
            className="theme-colour-preview"
            style={{
              display: "inline-block",
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: "1px solid rgba(0,0,0,0.1)",
              background: value || "#FFFFFF",
            }}
          ></span>
        </label>
        <div className="d-flex flex-column gap-2">
          <input
            type="text"
            className={`form-control ${error ? "is-invalid" : ""}`}
            placeholder="#FA5252"
            {...register(fieldName)}
          />
          <input
            type="color"
            className="form-control form-control-color"
            value={colorValue}
            onChange={(event) =>
              setValue(fieldName, event.target.value, { shouldDirty: true })
            }
            title={`${field.label} colour`}
            style={{ maxWidth: 64, width: 64, height: 40, padding: 0, border: "none" }}
          />
        </div>
        {error ? <div className="invalid-feedback d-block">{error}</div> : null}
      </div>
    );
  };

  const paletteError = errors?.theme?.paletteVariants;

  const renderGradientEditor = (key, label) => {
    const angleField = `theme.gradients.${key}.angle`;
    const stopErrors =
      errors?.theme?.gradients?.[key]?.stops || [];
    const stopsCount = Math.max(
      Array.isArray(gradientsState?.[key]?.stops)
        ? gradientsState[key].stops.length
        : 0,
      2
    );
    const angleError =
      errors?.theme?.gradients?.[key]?.angle?.message || null;
    return (
      <div className="card inner-card" key={key}>
        <div className="card-body">
          <h6>{label}</h6>
          <div
            className="resume-card-grid compact align-items-end"
            style={{ gridTemplateColumns: RESPONSIVE_GRID_TEMPLATE, gap: "1.25rem" }}
          >
            <div className="form-group">
              <label className="form-label">Angle</label>
              <input
                type="number"
                className={`form-control ${angleError ? "is-invalid" : ""}`}
                placeholder="135"
                {...register(angleField, {
                  valueAsNumber: true,
                })}
              />
              {angleError ? (
                <div className="invalid-feedback d-block">{angleError}</div>
              ) : null}
            </div>
            {Array.from({ length: stopsCount }).map((_, index) => {
              const fieldName = `theme.gradients.${key}.stops.${index}`;
              const currentValue =
                gradientsState?.[key]?.stops?.[index] || "";
              const stopError =
                Array.isArray(stopErrors) && stopErrors[index]
                  ? stopErrors[index].message
                  : null;
              const swatchValue = toColorInputValue(currentValue, "#FA5252");
              return (
                <div className="form-group" key={`${key}-stop-${index}`}>
                  <label className="form-label">
                    {index === 0 ? "Start colour" : "End colour"}
                  </label>
                  <div className="d-flex flex-column gap-2">
                    <input
                      type="text"
                      className={`form-control ${
                        stopError ? "is-invalid" : ""
                      }`}
                      placeholder="#FA5252"
                      {...register(fieldName)}
                    />
                    <input
                      type="color"
                      className="form-control form-control-color"
                      value={swatchValue}
                      onChange={(event) =>
                        setValue(fieldName, event.target.value, {
                          shouldDirty: true,
                        })
                      }
                      title={`${label} stop ${index + 1}`}
                      style={{ maxWidth: 64, width: 64, height: 40, padding: 0, border: "none" }}
                    />
                  </div>
                  {stopError ? (
                    <div className="invalid-feedback d-block">{stopError}</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const overlayErrors = errors?.theme?.backgroundOverlay || {};

  const animationsErrors = errors?.theme?.animations || {};

  const layoutErrors = errors?.layout || {};
  const featureErrors = errors?.features || {};
  const contentErrors = errors?.content?.hero || {};
  const presetScrollHintId = useId();
  const showPresetHint =
    !loading && !themeError && Array.isArray(themePresetsData) && themePresetsData.length > 0;

  return (
    <div className="theme-step-mobile-wrap">
      <form
        className="theme-form resume-form w-100 space-y-8 sm:space-y-10"
        onSubmit={handleSubmit(submitForm)}
        noValidate
      >
      {serverError ? (
        <div className="error-message text-center">{serverError}</div>
      ) : null}
      
      <section className="theme-step">
        <div className="theme-step-container space-y-4">
          <section className="onboarding-intro-card mb-6">
            <div className="intro-icon">
              <i className="fa fa-paint-brush fa-lg" aria-hidden="true"></i>
            </div>
            <div>
              <h2 className="intro-title">{t("themeAndPolish")}</h2>
              <p className="intro-subtitle text-muted-foreground">
                {t("themeDescription")}
              </p>
            </div>
          </section>
          
          <section className="resume-step-card">
            <header className="preset-toolbar mb-4">
              <div className="preset-toolbar-text">
                <h3 className="toolbar-title">{t("presetThemes")}</h3>
                <p className="toolbar-helper">{t("presetDescription")}</p>
              </div>
              <div className="preset-toolbar-toggle">
                <ModeSegmented
                  value={themeMode}
                  onChange={handleModeChange}
                  disabled={submitting}
                />
              </div>
            </header>
            <div className="theme-carousel-wrapper mt-5">
              <div className="carousel-fade left"></div>
              <div className="carousel-fade right"></div>
              <div
                role="listbox"
                aria-label="Theme gallery"
                aria-describedby={showPresetHint ? presetScrollHintId : undefined}
                className="theme-carousel"
                onKeyDown={handlePresetListKeyDown}
              >
                {loading ? (
                  // Loading state - render 4 skeleton cards
                  Array.from({ length: 4 }).map((_, index) => (
                    <SkeletonCard key={`skeleton-${index}`} />
                  ))
                ) : themeError ? (
                  // Error state - render inline error
                  <div className="preset-inline-feedback" style={{ gridColumn: "1 / -1" }}>
                    <InlineError 
                      message={themeError.message || "Failed to load theme presets"}
                      onRetry={handleRefetch}
                    />
                  </div>
                ) : themePresetsData.length === 0 ? (
                  // Empty state - render callout
                  <div className="preset-inline-feedback" style={{ gridColumn: "1 / -1" }}>
                    <Callout variant="info">
                      No themes yet
                    </Callout>
                  </div>
                ) : (
                  // Success state - render theme presets
                  <>
                    {themePresetsData.map((preset, index) => (
                      <ThemePresetCard
                        key={preset.id}
                        preset={preset}
                        selected={themeId === preset.id}
                        currentMode={themeMode}
                        preview={presetPreviewMap[preset.id]}
                        onSelectPreset={() => handlePresetSelect(preset.id, themeMode)}
                        disabled={submitting}
                        index={index}
                        totalCount={themePresetsData.length + 1}
                        activeIndex={activeIndex}
                      />
                    ))}
                    <CustomThemeCard
                      active={themeId === "custom"}
                      currentMode={themeMode}
                      preview={livePreview}
                      onSelect={handleCustomSelect}
                      disabled={submitting}
                      index={themePresetsData.length}
                      totalCount={themePresetsData.length + 1}
                      activeIndex={activeIndex}
                    />
                  </>
                )}
              </div>
              {showPresetHint ? (
                <p id={presetScrollHintId} className="preset-scroll-hint text-muted small">
                  Swipe or use arrows to explore the full theme collection.
                </p>
              ) : null}
            </div>
          </section>
          
          {isCustomTheme ? (
            <>
              <section className="resume-step-card">
                <header className="d-flex justify-content-between align-items-center">
                  <h3 className="text-lg font-semibold">{t("coloursAndPalette")}</h3>
                  <button
                    type="button"
                    className="resume-add-btn"
                    onClick={() => {
                      const newShowAdvanced = !showAdvanced;
                      setShowAdvanced(newShowAdvanced);
                      
                      // Track analytics for advanced config toggle
                      if (newShowAdvanced) {
                        analytics.onOpenAdvanced({
                          themeId: themeId,
                          mode: themeMode,
                          source: 'toggle_button'
                        });
                      }
                    }}
                  >
                    {showAdvanced ? t("hideAdvanced") : t("showAdvanced")}
                  </button>
                </header>
        <div className="color-tokens-section">
          <h6>Color Tokens</h6>
          <div className="token-rows">
            <TokenRow
              label="Primary"
              colors={SAMPLE_PALETTES.primary}
              onColorSelect={(color) => handleColorTokenSelect("primary", color)}
              surfaceColor={activePalette.surface || "#ffffff"}
              disabled={isAdvancedDisabled}
            />
            <TokenRow
              label="Secondary"
              colors={SAMPLE_PALETTES.secondary}
              onColorSelect={(color) => handleColorTokenSelect("secondary", color)}
              surfaceColor={activePalette.surface || "#ffffff"}
              disabled={isAdvancedDisabled}
            />
            <TokenRow
              label="Accent"
              colors={SAMPLE_PALETTES.accent}
              onColorSelect={(color) => handleColorTokenSelect("emphasis", color)}
              surfaceColor={activePalette.surface || "#ffffff"}
              disabled={isAdvancedDisabled}
            />
            <TokenRow
              label="Surface"
              colors={SAMPLE_PALETTES.surface}
              onColorSelect={(color) => handleColorTokenSelect("surface", color)}
              surfaceColor={activePalette.background || "#ffffff"}
              disabled={isAdvancedDisabled}
            />
          </div>
        </div>

        <div className="advanced-color-fields">
          <h6>Advanced Color Settings</h6>
          <div
            className="resume-card-grid compact"
            style={{ gridTemplateColumns: RESPONSIVE_GRID_TEMPLATE, gap: "1.25rem" }}
          >
            <div>
              <h6>Light mode</h6>
              <div
                className="resume-card-grid compact"
                style={{ gridTemplateColumns: RESPONSIVE_GRID_TEMPLATE, gap: "1.25rem" }}
              >
                {MODE_COLOR_FIELDS.map((field) =>
                  renderColorField("light", field)
                )}
              </div>
            </div>
            <div>
              <h6>Dark mode</h6>
              <div
                className="resume-card-grid compact"
                style={{ gridTemplateColumns: RESPONSIVE_GRID_TEMPLATE, gap: "1.25rem" }}
              >
                {MODE_COLOR_FIELDS.map((field) =>
                  renderColorField("dark", field)
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className="resume-card-grid compact"
          style={{ gridTemplateColumns: RESPONSIVE_GRID_TEMPLATE, gap: "1.25rem" }}
        >
          {["primary", "primaryHover"].map((key) =>
            renderGradientEditor(
              key,
              key === "primary" ? "Primary gradient" : "Hover gradient"
            )
          )}
        </div>

        <div className="palette-editor">
          <h6>Palette variants</h6>
          <p className="text-muted small">
            Adjust the quick-access swatches used for gradients, accents, and badges.
          </p>
          {paletteValues.length === 0 ? (
            <p className="text-muted fst-italic">
              Palette values will appear here once defined in your theme preset.
            </p>
          ) : (
            <div
              className="resume-card-grid compact"
              style={{ gridTemplateColumns: RESPONSIVE_GRID_TEMPLATE, gap: "1.25rem" }}
            >
              {paletteValues.map((value, index) => {
                const fieldName = `theme.paletteVariants.${index}`;
                const fieldError = Array.isArray(paletteError)
                  ? paletteError[index]?.message
                  : null;
                const swatchValue = toColorInputValue(value, "#FA5252");
                return (
                  <div className="form-group" key={fieldName}>
                    <label className="form-label d-flex justify-content-between align-items-center">
                      <span>Colour {index + 1}</span>
                      <span
                        className="theme-colour-preview"
                        style={{
                          display: "inline-block",
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          border: "1px solid rgba(0,0,0,0.1)",
                          background: value || "#FFFFFF",
                        }}
                      ></span>
                    </label>
                    <div className="d-flex flex-column gap-2">
                      <input
                        type="text"
                        className={`form-control ${
                          fieldError ? "is-invalid" : ""
                        }`}
                        placeholder="#FA5252"
                        {...register(fieldName)}
                      />
                      <input
                        type="color"
                        className="form-control form-control-color"
                        value={swatchValue}
                        onChange={(event) =>
                          setValue(fieldName, event.target.value, {
                            shouldDirty: true,
                          })
                        }
                        title={`Palette colour ${index + 1}`}
                        style={{ maxWidth: 64, width: 64, height: 40, padding: 0, border: "none" }}
                      />
                    </div>
                    {fieldError ? (
                      <div className="invalid-feedback d-block">
                        {fieldError}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

          {showAdvanced ? (
        <>
          <section className="resume-step-card">
            <header>
              <h3 className="text-lg font-semibold">{t("backgroundOverlay")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("overlayDescription")}
              </p>
            </header>
            <div className="resume-card-grid compact">
              <Controller
                control={control}
                name="theme.backgroundOverlay.enabled"
                render={({ field }) => (
                  <label className="resume-toggle">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                    />
                    <span className="slider" />
                    <span className="label-text">Enable overlay</span>
                  </label>
                )}
              />
              <div className="form-group">
                <label className="form-label">Icon</label>
                <input
                  type="text"
                  className={`form-control ${
                    overlayErrors?.icon?.message ? "is-invalid" : ""
                  }`}
                  placeholder="*"
                  {...register("theme.backgroundOverlay.icon")}
                />
                {overlayErrors?.icon?.message ? (
                  <div className="invalid-feedback d-block">
                    {overlayErrors.icon.message}
                  </div>
                ) : null}
              </div>
              <div className="form-group">
                <label className="form-label">Overlay colour token</label>
                <input
                  type="text"
                  className={`form-control ${
                    overlayErrors?.color?.message ? "is-invalid" : ""
                  }`}
                  placeholder="secondary"
                  {...register("theme.backgroundOverlay.color")}
                />
                {overlayErrors?.color?.message ? (
                  <div className="invalid-feedback d-block">
                    {overlayErrors.color.message}
                  </div>
                ) : null}
              </div>
              <div className="form-group">
                <label className="form-label">Density</label>
                <input
                  type="number"
                  className={`form-control ${
                    overlayErrors?.density?.message ? "is-invalid" : ""
                  }`}
                  placeholder="120"
                  {...register("theme.backgroundOverlay.density", {
                    valueAsNumber: true,
                  })}
                />
                {overlayErrors?.density?.message ? (
                  <div className="invalid-feedback d-block">
                    {overlayErrors.density.message}
                  </div>
                ) : null}
              </div>
              <div className="form-group">
                <label className="form-label">Size</label>
                <input
                  type="number"
                  className={`form-control ${
                    overlayErrors?.size?.message ? "is-invalid" : ""
                  }`}
                  placeholder="18"
                  {...register("theme.backgroundOverlay.size", {
                    valueAsNumber: true,
                  })}
                />
                {overlayErrors?.size?.message ? (
                  <div className="invalid-feedback d-block">
                    {overlayErrors.size.message}
                  </div>
                ) : null}
              </div>
              <div className="form-group">
                <label className="form-label">Opacity</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  className={`form-control ${
                    overlayErrors?.opacity?.message ? "is-invalid" : ""
                  }`}
                  placeholder="0.14"
                  {...register("theme.backgroundOverlay.opacity", {
                    valueAsNumber: true,
                  })}
                />
                {overlayErrors?.opacity?.message ? (
                  <div className="invalid-feedback d-block">
                    {overlayErrors.opacity.message}
                  </div>
                ) : null}
              </div>
              <div className="form-group">
                <label className="form-label">Animation speed</label>
                <input
                  type="number"
                  className={`form-control ${
                    overlayErrors?.animation?.speed?.message ? "is-invalid" : ""
                  }`}
                  placeholder="22"
                  {...register("theme.backgroundOverlay.animation.speed", {
                    valueAsNumber: true,
                  })}
                />
                {overlayErrors?.animation?.speed?.message ? (
                  <div className="invalid-feedback d-block">
                    {overlayErrors.animation.speed.message}
                  </div>
                ) : null}
              </div>
              <div className="form-group">
                <label className="form-label">Animation variance</label>
                <input
                  type="number"
                  className={`form-control ${
                    overlayErrors?.animation?.variance?.message
                      ? "is-invalid"
                      : ""
                  }`}
                  placeholder="16"
                  {...register("theme.backgroundOverlay.animation.variance", {
                    valueAsNumber: true,
                  })}
                />
                {overlayErrors?.animation?.variance?.message ? (
                  <div className="invalid-feedback d-block">
                    {overlayErrors.animation.variance.message}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="resume-step-card">
            <header>
              <h3 className="text-lg font-semibold">{t("motionSettings")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("motionDescription")}
              </p>
            </header>
            <div className="resume-card-grid compact">
              <div className="form-group">
                <label className="form-label">Animation preset</label>
                <input
                  type="text"
                  className={`form-control ${
                    animationsErrors?.preset?.message ? "is-invalid" : ""
                  }`}
                  placeholder="bostami"
                  {...register("theme.animations.preset")}
                />
                {animationsErrors?.preset?.message ? (
                  <div className="invalid-feedback d-block">
                    {animationsErrors.preset.message}
                  </div>
                ) : null}
              </div>
              <div className="form-group">
                <label className="form-label">Card duration</label>
                <input
                  type="number"
                  step="0.05"
                  className={`form-control ${
                    animationsErrors?.card?.transition?.duration?.message
                      ? "is-invalid"
                      : ""
                  }`}
                  placeholder="0.4"
                  {...register("theme.animations.card.transition.duration", {
                    valueAsNumber: true,
                  })}
                />
                {animationsErrors?.card?.transition?.duration?.message ? (
                  <div className="invalid-feedback d-block">
                    {animationsErrors.card.transition.duration.message}
                  </div>
                ) : null}
              </div>
              <div className="form-group">
                <label className="form-label">Card easing</label>
                <input
                  type="text"
                  className={`form-control ${
                    animationsErrors?.card?.transition?.ease?.message
                      ? "is-invalid"
                      : ""
                  }`}
                  placeholder="easeOut"
                  {...register("theme.animations.card.transition.ease")}
                />
                {animationsErrors?.card?.transition?.ease?.message ? (
                  <div className="invalid-feedback d-block">
                    {animationsErrors.card.transition.ease.message}
                  </div>
                ) : null}
              </div>
              <div className="form-group">
                <label className="form-label">Section duration</label>
                <input
                  type="number"
                  step="0.05"
                  className={`form-control ${
                    animationsErrors?.section?.transition?.duration?.message
                      ? "is-invalid"
                      : ""
                  }`}
                  placeholder="0.6"
                  {...register("theme.animations.section.transition.duration", {
                    valueAsNumber: true,
                  })}
                />
                {animationsErrors?.section?.transition?.duration?.message ? (
                  <div className="invalid-feedback d-block">
                    {animationsErrors.section.transition.duration.message}
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </>
          ) : null}

        </>
      ) : (
        <Accordion 
          id="advanced-config"
          defaultCollapsed={themeId !== "custom"}
          header={
            <div>
              <h3 className="text-lg font-semibold mb-0">{t("advancedConfiguration")}</h3>
              <p className="text-sm text-muted-foreground mb-0">{t("advancedDescription")}</p>
            </div>
          }
        >
          <div className="text-center">
            <CustomThemeCTA
              onClick={() => handleCustomThemeCTA('advanced_config')}
              disabled={submitting}
              variant="secondary"
              analyticsId="cta_custom_theme"
            />
          </div>
        </Accordion>
      )}
      {isCustomTheme && (
        <Accordion 
          id="custom-theme-sections"
          defaultCollapsed={false}
          disabled={isAdvancedDisabled}
          header={
            <div>
              <h3 className="text-lg font-semibold mb-0">{t("customThemeSettings")}</h3>
              <p className="text-sm text-muted-foreground mb-0">{t("customThemeDescription")}</p>
            </div>
          }
        >
          <>
      <section className="resume-step-card">
        <header>
          <h3 className="text-lg font-semibold">{t("layoutPreferences")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("layoutDescription")}
          </p>
        </header>
        <div className="resume-card-grid compact">
          <div className="form-group">
            <label className="form-label">Sidebar position</label>
            <Controller
              control={control}
              name="layout.sidebarPosition"
              render={({ field }) => (
                <>
                  <div className="theme-options" style={CHIP_GROUP_STYLE}>
                    {[
                      { value: "left", label: "Sidebar left" },
                      { value: "right", label: "Sidebar right" },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`theme-chip ${
                          field.value === option.value ? "active" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          checked={field.value === option.value}
                          onChange={() => field.onChange(option.value)}
                          name="layout-sidebar-position"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {layoutErrors?.sidebarPosition?.message ? (
                    <div className="invalid-feedback d-block">
                      {layoutErrors.sidebarPosition.message}
                    </div>
                  ) : null}
                </>
              )}
            />
          </div>
          <Controller
            control={control}
            name="layout.showSidebarProfileCard"
            render={({ field }) => (
              <label className="resume-toggle">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
                <span className="slider" />
                <span className="label-text">Show profile card</span>
              </label>
            )}
          />
          <Controller
            control={control}
            name="layout.showHeaderActions"
            render={({ field }) => (
              <label className="resume-toggle">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
                <span className="slider" />
                <span className="label-text">Display header actions</span>
              </label>
            )}
          />
          <Controller
            control={control}
            name="layout.enableStickySidebar"
            render={({ field }) => (
              <label className="resume-toggle">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
                <span className="slider" />
                <span className="label-text">Enable sticky sidebar</span>
              </label>
            )}
          />
          <Controller
            control={control}
            name="layout.mobileMenuCollapsed"
            render={({ field }) => (
              <label className="resume-toggle">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
                <span className="slider" />
                <span className="label-text">Collapse mobile menu by default</span>
              </label>
            )}
          />
          <Controller
            control={control}
            name="layout.panels.contact.visible"
            render={({ field }) => (
              <label className="resume-toggle">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
                <span className="slider" />
                <span className="label-text">Show contact panel</span>
              </label>
            )}
          />
          <Controller
            control={control}
            name="layout.panels.portfolio.visible"
            render={({ field }) => (
              <label className="resume-toggle">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
                <span className="slider" />
                <span className="label-text">Show portfolio panel</span>
              </label>
            )}
          />
          <Controller
            control={control}
            name="layout.panels.portfolio.displayFilters"
            render={({ field }) => (
              <label className="resume-toggle">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
                <span className="slider" />
                <span className="label-text">Display portfolio filters</span>
              </label>
            )}
          />
        </div>
      </section>

      <section className="resume-step-card">
        <header>
          <h3 className="text-lg font-semibold">{t("featureFlags")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("featuresDescription")}
          </p>
        </header>
        <div className="resume-card-grid compact">
          <Controller
            control={control}
            name="features.allowThemeToggle"
            render={({ field }) => (
              <label className="resume-toggle">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
                <span className="slider" />
                <span className="label-text">Allow visitor theme toggle</span>
              </label>
            )}
          />
          <Controller
            control={control}
            name="features.autoApplyConfigTheme"
            render={({ field }) => (
              <label className="resume-toggle">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
                <span className="slider" />
                <span className="label-text">Auto apply config theme</span>
              </label>
            )}
          />
          <Controller
            control={control}
            name="features.persistThemeMode"
            render={({ field }) => (
              <label className="resume-toggle">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
                <span className="slider" />
                <span className="label-text">Remember visitor selection</span>
              </label>
            )}
          />
          <Controller
            control={control}
            name="features.animations.enabled"
            render={({ field }) => (
              <label className="resume-toggle">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
                <span className="slider" />
                <span className="label-text">Enable resume animations</span>
              </label>
            )}
          />
          <div className="form-group">
            <label className="form-label">Animation preset</label>
            <input
              type="text"
              className={`form-control ${
                featureErrors?.animations?.preset?.message ? "is-invalid" : ""
              }`}
              placeholder="bostami"
              {...register("features.animations.preset")}
            />
            {featureErrors?.animations?.preset?.message ? (
              <div className="invalid-feedback d-block">
                {featureErrors.animations.preset.message}
              </div>
            ) : null}
          </div>
          <div className="form-group">
            <label className="form-label">Default CV template</label>
            <Controller
              control={control}
              name="features.cvTemplate"
              render={({ field }) => (
                <>
                  <div className="theme-options" style={CHIP_GROUP_STYLE}>
                    {AVAILABLE_THEME_OPTIONS.filter(
                      (option) => option.id !== "custom"
                    ).map((option) => (
                      <label
                        key={option.id}
                        className={`theme-chip ${
                          field.value === option.id ? "active" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          value={option.id}
                          checked={field.value === option.id}
                          onChange={() => field.onChange(option.id)}
                          name="features-cv-template"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                    <label
                      className={`theme-chip ${
                        field.value === "custom" ? "active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        value="custom"
                        checked={field.value === "custom"}
                        onChange={() => field.onChange("custom")}
                        name="features-cv-template"
                      />
                      <span>Custom Theme</span>
                    </label>
                  </div>
                  {featureErrors?.cvTemplate?.message ? (
                    <div className="invalid-feedback d-block">
                      {featureErrors.cvTemplate.message}
                    </div>
                  ) : null}
                </>
              )}
            />
          </div>
        </div>

        <div className="pdf-templates">
          <h6>PDF templates</h6>
          <p className="text-muted small">
            Update display labels or identifiers for the fixed set of export options.
          </p>
          {pdfTemplates.length === 0 ? (
            <p className="text-muted fst-italic">
              No PDF templates are configured for this account.
            </p>
          ) : (
            pdfTemplates.map((_, index) => {
              const templateError = Array.isArray(featureErrors?.pdfTemplates)
                ? featureErrors.pdfTemplates[index]
                : null;
              return (
                <div className="card inner-card" key={`pdf-template-${index}`}>
                  <div className="card-body">
                    <div className="resume-card-grid compact">
                      <div className="form-group">
                        <label className="form-label">Template id</label>
                        <input
                          type="text"
                          className={`form-control ${
                            templateError?.id?.message ? "is-invalid" : ""
                          }`}
                          placeholder="bostami"
                          {...register(`features.pdfTemplates.${index}.id`)}
                        />
                        {templateError?.id?.message ? (
                          <div className="invalid-feedback d-block">
                            {templateError.id.message}
                          </div>
                        ) : null}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Template label</label>
                        <input
                          type="text"
                          className={`form-control ${
                            templateError?.label?.message ? "is-invalid" : ""
                          }`}
                          placeholder="Bostami Classic"
                          {...register(`features.pdfTemplates.${index}.label`)}
                        />
                        {templateError?.label?.message ? (
                          <div className="invalid-feedback d-block">
                            {templateError.label.message}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <p className="text-muted small">
            Need additional templates? Reach out to your administrator to enable them.
          </p>
        </div>
      </section>

      <section className="resume-step-card">
        <header>
          <h3 className="text-lg font-semibold">{t("heroContent")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("heroDescription")}
          </p>
        </header>
        <div className="resume-card-grid wider">
          <div className="form-group">
            <label className="form-label">{t("greeting")}</label>
            <input
              type="text"
              className={`form-control ${
                contentErrors?.greeting?.message ? "is-invalid" : ""
              }`}
              placeholder={t("greetingPlaceholder")}
              {...register("content.hero.greeting")}
            />
            {contentErrors?.greeting?.message ? (
              <div className="invalid-feedback d-block">
                {contentErrors.greeting.message}
              </div>
            ) : null}
          </div>
          <div className="form-group">
            <label className="form-label">{t("headline")}</label>
            <input
              type="text"
              className={`form-control ${
                contentErrors?.headline?.message ? "is-invalid" : ""
              }`}
              placeholder={t("headlinePlaceholder")}
              {...register("content.hero.headline")}
            />
            {contentErrors?.headline?.message ? (
              <div className="invalid-feedback d-block">
                {contentErrors.headline.message}
              </div>
            ) : null}
          </div>
          <div className="form-group">
            <label className="form-label">{t("subtitle")}</label>
            <input
              type="text"
              className={`form-control ${
                contentErrors?.subtitle?.message ? "is-invalid" : ""
              }`}
              placeholder={t("subtitlePlaceholder")}
              {...register("content.hero.subtitle")}
            />
            {contentErrors?.subtitle?.message ? (
              <div className="invalid-feedback d-block">
                {contentErrors.subtitle.message}
              </div>
            ) : null}
          </div>
          <div className="form-group full">
            <label className="form-label">{t("summary")}</label>
            <textarea
              className={`form-control ${
                contentErrors?.summary?.message ? "is-invalid" : ""
              }`}
              rows={3}
              placeholder={t("summaryPlaceholder")}
              {...register("content.hero.summary")}
            />
            {contentErrors?.summary?.message ? (
              <div className="invalid-feedback d-block">
                {contentErrors.summary.message}
              </div>
            ) : null}
          </div>
        </div>
      </section>
          </>
        </Accordion>
      )}
        </div>
      </section>
      
      <div className="text-center text-md-end">
        <div className="d-flex gap-3 justify-content-center justify-content-md-end">
          <PreviewButton 
            subdomain={defaultValues?.subdomain}
            disabled={submitting}
          />
          <button
            type="submit"
            className="resume-save-btn"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <i className="fa fa-spinner fa-pulse me-2" aria-hidden="true"></i>
                Saving…
              </>
            ) : (
              nextLabel
            )}
          </button>
        </div>
      </div>
      
        <DirtySaveBar
          isDirty={isDirty}
          onSave={handleSubmit(submitForm)}
          onReset={handleReset}
          submitting={submitting}
          saveLabel={nextLabel}
          resetLabel="Reset"
        />
      </form>
    </div>
  );
};

export default ThemeStep;

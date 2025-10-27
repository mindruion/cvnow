import { useEffect, useMemo, useState } from "react";
import UseData from "../Hooks/UseData";
import "./BackgroundOverlay.css";

const COLOR_KEYS = new Set([
  "primary",
  "secondary",
  "background",
  "surface",
  "surfaceMuted",
  "surfaceElevation",
  "text",
  "textMuted",
  "border",
  "emphasis",
]);

const toCssVar = (key) => {
  if (!key) {
    return "var(--color-primary)";
  }

  if (key.startsWith("#") || key.startsWith("rgb")) {
    return key;
  }

  const normalized = key
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();

  if (COLOR_KEYS.has(key) || COLOR_KEYS.has(normalized)) {
    return `var(--color-${normalized})`;
  }

  return `var(--color-${normalized})`;
};

const generatePositions = (count, seed, config) => {
  const positions = [];
  const random = (() => {
    let x = Math.sin(seed + 1) * 10000;
    return () => {
      x = Math.sin(x + 1) * 10000;
      return x - Math.floor(x);
    };
  })();
  const baseSize = config?.size || 14;
  const baseSpeed = Math.max(6, config?.animation?.speed || 18);
  const variance = Math.max(1, config?.animation?.variance || 12);
  const spread = baseSize * 6;
  const timingOptions = ["ease-in-out", "ease-in", "ease-out", "ease"];

  for (let index = 0; index < count; index += 1) {
    const sizeFactor = 0.75 + random() * 1.4;
    const floatX = spread * (0.25 + random() * 0.9);
    const floatY = spread * (0.25 + random() * 0.9);
    const scale = 0.92 + random() * 0.22;
    const duration = baseSpeed + random() * variance;
    const direction = random() > 0.5 ? "alternate" : "alternate-reverse";
    const timing =
      timingOptions[Math.floor(random() * timingOptions.length)] ||
      "ease-in-out";

    positions.push({
      id: `${seed}-${index}`,
      left: random() * 100,
      top: random() * 100,
      sizeFactor,
      floatX,
      floatY,
      floatXWeak: floatX * 0.35,
      floatYWeak: floatY * 0.35,
      scale,
      delay: random() * (baseSpeed + variance),
      duration,
      direction,
      timing,
    });
  }

  return positions;
};

const BackgroundOverlay = () => {
  const { theme, activeThemeId, themeMode } = UseData();
  const overlayConfig =
    theme?.backgroundOverlay || {
      enabled: false,
    };

  const [dots, setDots] = useState([]);

  const color = useMemo(
    () => toCssVar(overlayConfig.color),
    [overlayConfig.color]
  );
  const overlayEnabled = overlayConfig?.enabled ?? false;
  const overlayDensity = overlayConfig?.density;
  const overlaySize = overlayConfig?.size;
  const overlaySpeed = overlayConfig?.animation?.speed;
  const overlayVariance = overlayConfig?.animation?.variance;

  useEffect(() => {
    if (!overlayEnabled) {
      setDots([]);
      return;
    }

    const density = Math.max(10, Math.min(overlayDensity || 80, 200));
    const seed =
      (activeThemeId?.length || 1) * 31 +
      density * 17 +
      (themeMode === "dark" ? 97 : 53);
    setDots(
      generatePositions(density, seed, {
        size: overlaySize,
        animation: { speed: overlaySpeed, variance: overlayVariance },
      })
    );
  }, [
    overlayEnabled,
    overlayDensity,
    overlaySize,
    overlaySpeed,
    overlayVariance,
    activeThemeId,
    themeMode,
  ]);

  if (!overlayConfig.enabled) {
    return null;
  }

  const icon = overlayConfig.icon || "•";
  const opacity =
    overlayConfig.opacity !== undefined ? overlayConfig.opacity : 0.12;
  const baseSize = overlayConfig.size || 14;
  const animationSpeed = overlayConfig.animation?.speed || 18;
  const animationVariance = overlayConfig.animation?.variance || 12;
  const blendMode = overlayConfig.blendMode || "screen";

  return (
    <div
      className="background-overlay"
      style={{
        "--overlay-color": color,
        "--overlay-opacity": opacity,
        "--overlay-speed": animationSpeed,
        "--overlay-variance": animationVariance,
        "--overlay-blend-mode": blendMode,
      }}
    >
      {dots.map((dot) => (
        <span
          key={dot.id}
          className="background-overlay__item"
          style={{
            left: `${dot.left}%`,
            top: `${dot.top}%`,
            fontSize: `${baseSize * dot.sizeFactor}px`,
            animationDelay: `${dot.delay}s`,
            animationDuration: `${dot.duration}s`,
            animationDirection: dot.direction,
            animationTimingFunction: dot.timing,
            "--float-x": `${dot.floatX}px`,
            "--float-x-neg": `${-dot.floatX}px`,
            "--float-y": `${dot.floatY}px`,
            "--float-y-neg": `${-dot.floatY}px`,
            "--float-x-weak": `${dot.floatXWeak}px`,
            "--float-y-weak": `${dot.floatYWeak}px`,
            "--scale": dot.scale,
          }}
        >
          {icon}
        </span>
      ))}
    </div>
  );
};

export default BackgroundOverlay;

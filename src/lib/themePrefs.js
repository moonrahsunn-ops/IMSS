import { useState, useEffect } from "react";

const KEY = "theme_prefs";
const listeners = new Set();

function hexToHsl(hex) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function apply(p) {
  if (p.fontScale) document.documentElement.style.fontSize = `${16 * p.fontScale}px`;
  if (p.accent) {
    const h = hexToHsl(p.accent);
    document.documentElement.style.setProperty("--primary", h);
    document.documentElement.style.setProperty("--ring", h);
  }
}

let prefs = {};
try { prefs = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { prefs = {}; }
apply(prefs);

export function setThemePrefs(patch) {
  prefs = { ...prefs, ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* ignorar */ }
  apply(prefs);
  listeners.forEach((l) => l(prefs));
}

export function useThemePrefs() {
  const [p, setP] = useState(prefs);
  useEffect(() => {
    const l = (v) => setP(v);
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);
  return [p, setThemePrefs];
}

export const FONT_SCALES = [
  { label: "Chica", value: 0.875 },
  { label: "Normal", value: 1 },
  { label: "Grande", value: 1.125 },
  { label: "Muy grande", value: 1.25 },
];

export const ACCENT_PRESETS = [
  { label: "Negro", value: "#111111" },
  { label: "Gris", value: "#525252" },
  { label: "Azul", value: "#2563eb" },
  { label: "Verde", value: "#16a34a" },
  { label: "Violeta", value: "#7c3aed" },
  { label: "Naranja", value: "#ea580c" },
];

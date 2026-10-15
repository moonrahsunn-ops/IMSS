import React from "react";
import { useThemePrefs, FONT_SCALES, ACCENT_PRESETS } from "@/lib/themePrefs";

export default function AppearancePrefs() {
  const [prefs, setPrefs] = useThemePrefs();
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 space-y-5">
      <h3 className="text-sm font-medium">Apariencia</h3>

      <div>
        <p className="text-xs text-neutral-500 mb-2">Tamaño de letra</p>
        <div className="flex flex-wrap gap-2">
          {FONT_SCALES.map((s) => (
            <button key={s.value} onClick={() => setPrefs({ fontScale: s.value })}
              className={`px-3 py-1.5 rounded-full text-xs border ${
                (prefs.fontScale || 1) === s.value ? "bg-neutral-900 text-white border-neutral-900" : "bg-white border-neutral-200"
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-neutral-500 mb-2">Color de acento</p>
        <div className="flex flex-wrap gap-2 items-center">
          {ACCENT_PRESETS.map((c) => (
            <button key={c.value} onClick={() => setPrefs({ accent: c.value })}
              className={`flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-full border text-xs ${
                (prefs.accent || "#111111") === c.value ? "border-neutral-900 bg-neutral-50" : "border-neutral-200"
              }`}>
              <span className="w-4 h-4 rounded-full border border-neutral-300" style={{ background: c.value }} />
              {c.label}
            </button>
          ))}
          <label className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full border border-neutral-200 text-xs cursor-pointer">
            <span className="w-4 h-4 rounded-full border border-neutral-300"
              style={{ background: prefs.accent || "#111111" }} />
            Personalizado
            <input type="color" className="w-5 h-5 cursor-pointer"
              value={prefs.accent || "#111111"}
              onChange={(e) => setPrefs({ accent: e.target.value })} />
          </label>
        </div>
      </div>
    </div>
  );
}

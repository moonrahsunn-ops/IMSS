import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import "@/index.css";
import "@/lib/themePrefs";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

// Pide al navegador que no borre los datos guardados por falta de espacio.
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().catch(() => {});
}

// Modo sin conexión (solo en la versión publicada).
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}

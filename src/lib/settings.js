const KEY = "inventario_settings";

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

export function getSellerName() {
  return read().seller || "";
}

export function setSellerName(name) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...read(), seller: name })); } catch { /* ignorar */ }
}

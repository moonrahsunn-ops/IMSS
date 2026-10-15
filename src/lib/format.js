export const gs = (n) =>
  "Gs. " + Number(n || 0).toLocaleString("es-PY", { maximumFractionDigits: 0 });

export const totalStock = (stockArr) =>
  (stockArr || []).reduce((s, x) => s + Number(x.qty || 0), 0);

export const productStock = (product) =>
  (product?.colors || []).reduce((s, c) => s + totalStock(c.stock), 0);

export const closedBoxesTotal = (boxes) =>
  (boxes || []).reduce((sum, b) => {
    const perBoxColors = (b.colors || []).reduce((s, c) => s + Number(c.per_box || 0), 0);
    const perBox = perBoxColors || Number(b.units_per_box || 0);
    return sum + perBox * Number(b.quantity || 0);
  }, 0);

export const productTotalStock = (product) =>
  productStock(product) + closedBoxesTotal(product?.closed_boxes);

export const getPrices = (product) => {
  const list = (product?.prices || []).filter((x) => x && x.name);
  if (list.length) return list.map((x) => ({ name: x.name, amount: Number(x.amount || 0) }));
  const out = [];
  if (product?.price_wholesale != null && product.price_wholesale !== "")
    out.push({ name: "Mayorista", amount: Number(product.price_wholesale) });
  if (product?.price_retail != null && product.price_retail !== "")
    out.push({ name: "Minorista", amount: Number(product.price_retail) });
  return out;
};

export const closedBoxColorTotal = (boxes, colorName) =>
  (boxes || []).reduce((sum, b) => {
    const per = (b.colors || []).find((c) => c.name === colorName)?.per_box || 0;
    return sum + Number(per) * Number(b.quantity || 0);
  }, 0);

export const COLOR_PRESETS = [
  { name: "Negro", hex: "#111111" },
  { name: "Blanco", hex: "#f5f5f5" },
  { name: "Rosado", hex: "#f0b7c4" },
  { name: "Verde", hex: "#4b6b4b" },
  { name: "Azul", hex: "#2563eb" },
  { name: "Rojo", hex: "#dc2626" },
  { name: "Gris", hex: "#9ca3af" },
];

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { COLOR_PRESETS } from "@/lib/format";
import MultiImageUpload from "@/components/product/MultiImageUpload";

export default function ColorEditor({ colors, setColors, locations }) {
  const update = (i, patch) =>
    setColors(colors.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const setQty = (i, loc, qty) => {
    const stock = [...(colors[i].stock || [])];
    const found = stock.findIndex((s) => s.location === loc);
    if (found >= 0) stock[found] = { location: loc, qty: Number(qty || 0) };
    else stock.push({ location: loc, qty: Number(qty || 0) });
    update(i, { stock });
  };

  return (
    <div className="space-y-3">
      {colors.map((c, i) => (
        <div key={i} className="p-3 rounded-2xl border border-neutral-200 bg-white space-y-3">
          <div className="flex gap-2 items-center">
            <span className="w-5 h-5 rounded-full border border-neutral-300 shrink-0" style={{ background: c.hex || "#ddd" }} />
            <Input value={c.name || ""} onChange={(e) => update(i, { name: e.target.value })} placeholder="Nombre del color" />
            <Input value={c.hex || ""} onChange={(e) => update(i, { hex: e.target.value })} placeholder="#000000" className="w-28" />
            <Button variant="ghost" size="icon" onClick={() => setColors(colors.filter((_, x) => x !== i))}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
          <MultiImageUpload
            label="Fotos de este color"
            value={c.images && c.images.length ? c.images : (c.image_url ? [c.image_url] : [])}
            onChange={(imgs) => update(i, { images: imgs, image_url: imgs[0] || "" })}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {locations.map((l) => (
              <div key={l.id || l.name}>
                <label className="text-xs text-neutral-500">{l.name}</label>
                <Input
                  type="number"
                  value={(c.stock || []).find((s) => s.location === l.name)?.qty ?? ""}
                  onChange={(e) => setQty(i, l.name, e.target.value)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        {COLOR_PRESETS.map((p) => (
          <Button key={p.name} type="button" variant="outline" size="sm" className="rounded-full gap-2"
            onClick={() => setColors([...colors, { ...p, stock: [] }])}>
            <span className="w-3 h-3 rounded-full border" style={{ background: p.hex }} />{p.name}
          </Button>
        ))}
        <Button type="button" variant="outline" size="sm" className="rounded-full gap-1"
          onClick={() => setColors([...colors, { name: "", hex: "#cccccc", stock: [] }])}>
          <Plus className="w-3 h-3" /> Otro
        </Button>
      </div>
    </div>
  );
}

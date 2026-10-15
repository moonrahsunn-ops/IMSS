import React, { useState } from "react";
import { Image } from "@/components/ui/image";
import { ImageIcon } from "lucide-react";
import { totalStock } from "@/lib/format";

const colorImages = (c) => (c?.images && c.images.length ? c.images : c?.image_url ? [c.image_url] : []);

export default function ColorStockPanel({ colors = [], locations = [] }) {
  const [idx, setIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const color = colors[idx];
  const imgs = colorImages(color);
  const locNames = locations.length ? locations : [...new Set((color?.stock || []).map((s) => s.location))];
  const qty = (loc) => Number((color?.stock || []).find((s) => s.location === loc)?.qty || 0);

  if (!colors.length)
    return <p className="text-sm text-neutral-400">Sin colores registrados.</p>;

  return (
    <div className="space-y-3">
      {/* Color swatches - compact horizontal */}
      <div className="flex flex-wrap gap-2">
        {colors.map((c, i) => (
          <button
            key={c.name + i}
            onClick={() => { setIdx(i); setImgIdx(0); }}
            className={`flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full border text-xs transition-colors ${
              i === idx ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-300"
            }`}
          >
            <span className="w-4 h-4 rounded-full border border-neutral-300" style={{ background: c.hex || "#ddd" }} />
            <span className="truncate">{c.name}</span>
          </button>
        ))}
      </div>

      {/* Image + table: stacked on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        <div className="sm:col-span-2 space-y-1.5">
          <div className="rounded-xl bg-neutral-50 border border-neutral-200 aspect-square flex items-center justify-center overflow-hidden">
            {imgs[imgIdx] ? (
              <Image src={imgs[imgIdx]} alt={color.name} fittingType="fit" className="w-full h-full" />
            ) : (
              <ImageIcon className="w-6 h-6 text-neutral-300" />
            )}
          </div>
          {imgs.length > 1 && (
            <div className="flex gap-1 overflow-x-auto">
              {imgs.map((u, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`w-10 h-10 rounded-lg overflow-hidden border shrink-0 ${i === imgIdx ? "border-neutral-900" : "border-neutral-200"}`}>
                  <Image src={u} alt="" fittingType="fit" className="w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="sm:col-span-3 rounded-xl border border-neutral-200 overflow-hidden self-start min-w-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-0">
              <thead>
                <tr className="text-[11px] text-neutral-500 bg-neutral-50 border-b border-neutral-200">
                  <th className="py-1.5 px-2 font-normal text-left whitespace-nowrap">Ubicación</th>
                  {locNames.map((l) => <th key={l} className="py-1.5 px-2 font-normal text-center whitespace-nowrap">{l}</th>)}
                  <th className="py-1.5 px-2 font-normal text-center whitespace-nowrap">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-neutral-100">
                  <td className="py-1.5 px-2 text-xs text-neutral-500 whitespace-nowrap">Stock</td>
                  {locNames.map((l) => <td key={l} className="py-1.5 px-2 text-center whitespace-nowrap">{qty(l)}</td>)}
                  <td className="py-1.5 px-2 text-center font-medium whitespace-nowrap">{totalStock(color?.stock)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex justify-between px-2 py-1.5 text-xs">
            <span className="text-neutral-500">Total del color</span>
            <span className="font-medium">{totalStock(color?.stock)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

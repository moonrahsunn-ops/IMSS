import React from "react";
import { Package } from "lucide-react";
import { totalStock, closedBoxColorTotal } from "@/lib/format";

export default function ClosedBoxPanel({ colors = [], closedBoxes = [], locations = [] }) {
  const locNames = locations.length
    ? locations
    : [...new Set((colors || []).flatMap((c) => (c.stock || []).map((s) => s.location)))];

  const outOfBox = (name) => {
    const c = colors.find((x) => x.name === name);
    return totalStock(c?.stock);
  };

  if (!colors.length && !closedBoxes.length)
    return <p className="text-sm text-neutral-400">Sin cajas cerradas registradas.</p>;

  return (
    <div className="space-y-4">
      {/* Fuera de caja */}
      <div className="rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-3 py-2 bg-neutral-50 border-b border-neutral-200 text-xs font-medium text-neutral-600">
          Fuera de caja
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] text-neutral-500 border-b border-neutral-100">
              <th className="py-1.5 px-3 font-normal text-left">Color</th>
              {locNames.map((l) => <th key={l} className="py-1.5 px-2 font-normal text-center">{l}</th>)}
              <th className="py-1.5 px-2 font-normal text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {colors.map((c) => (
              <tr key={c.name} className="border-b border-neutral-50">
                <td className="py-1.5 px-3 text-xs flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border border-neutral-300" style={{ background: c.hex || "#ddd" }} />
                  {c.name}
                </td>
                {locNames.map((l) => (
                  <td key={l} className="py-1.5 px-2 text-center">
                    {Number((c.stock || []).find((s) => s.location === l)?.qty || 0)}
                  </td>
                ))}
                <td className="py-1.5 px-2 text-center font-medium">{totalStock(c.stock)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cajas cerradas */}
      {closedBoxes.map((box, i) => (
        <div key={i} className="rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-3 py-2 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-600 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" />
              {box.name || "Caja cerrada"} ({box.units_per_box || 0} unidades)
            </span>
            <span className="text-xs text-neutral-500">
              Cantidad: {box.quantity || 0} {box.location ? `· ${box.location}` : ""}
            </span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-neutral-500 border-b border-neutral-100">
                <th className="py-1.5 px-3 font-normal text-left">Color</th>
                <th className="py-1.5 px-2 font-normal text-center">Cada caja</th>
                <th className="py-1.5 px-2 font-normal text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {(box.colors || []).map((c) => (
                <tr key={c.name} className="border-b border-neutral-50">
                  <td className="py-1.5 px-3 text-xs">{c.name}</td>
                  <td className="py-1.5 px-2 text-center">{c.per_box || 0}</td>
                  <td className="py-1.5 px-2 text-center font-medium">
                    {(c.per_box || 0) * (box.quantity || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Total de cada color */}
      <div className="rounded-xl border border-neutral-900 overflow-hidden">
        <div className="px-3 py-2 bg-neutral-900 text-white text-xs font-medium">
          Total de cada color (fuera de caja + cajas cerradas)
        </div>
        <table className="w-full text-sm">
          <tbody>
            {colors.map((c) => {
              const oob = outOfBox(c.name);
              const cb = closedBoxColorTotal(closedBoxes, c.name);
              return (
                <tr key={c.name} className="border-b border-neutral-50">
                  <td className="py-1.5 px-3 text-xs flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full border border-neutral-300" style={{ background: c.hex || "#ddd" }} />
                    {c.name}
                  </td>
                  <td className="py-1.5 px-3 text-right text-xs text-neutral-500">
                    {oob} + {cb}
                  </td>
                  <td className="py-1.5 px-3 text-right font-medium">{oob + cb}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

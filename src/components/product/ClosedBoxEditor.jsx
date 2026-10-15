import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ClosedBoxEditor({ boxes = [], setBoxes, colors = [], locations = [] }) {
  const update = (i, patch) => setBoxes(boxes.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  const remove = (i) => setBoxes(boxes.filter((_, idx) => idx !== i));
  const add = () =>
    setBoxes([...boxes, { name: "", units_per_box: "", quantity: "", location: "", colors: [] }]);

  const setPerBox = (i, name, val) => {
    const box = boxes[i];
    const rest = (box.colors || []).filter((c) => c.name !== name);
    const per = val === "" ? 0 : Number(val);
    update(i, { colors: per ? [...rest, { name, per_box: per }] : rest });
  };

  const perBoxOf = (box, name) => (box.colors || []).find((c) => c.name === name)?.per_box ?? "";

  return (
    <div className="space-y-3">
      {boxes.length === 0 && <p className="text-sm text-neutral-400">Sin cajas cerradas.</p>}
      {boxes.map((box, i) => (
        <div key={i} className="rounded-xl border border-neutral-200 p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Input
              value={box.name || ""}
              onChange={(e) => update(i, { name: e.target.value })}
              placeholder="Nombre de la caja (ej: Vaso color azul)"
              className="h-8 text-sm font-medium"
            />
            <Button variant="ghost" size="icon" onClick={() => remove(i)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Unidades por caja</Label>
              <Input type="number" value={box.units_per_box}
                onChange={(e) => update(i, { units_per_box: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Cantidad de cajas</Label>
              <Input type="number" value={box.quantity}
                onChange={(e) => update(i, { quantity: e.target.value })} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Ubicación</Label>
            <Select value={box.location} onValueChange={(v) => update(i, { location: v })}>
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                {locations.map((l) => <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {colors.length > 0 && (
            <div>
              <Label className="text-xs">Unidades de cada color por caja</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {colors.map((c) => (
                  <div key={c.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border border-neutral-300 shrink-0" style={{ background: c.hex || "#ddd" }} />
                    <span className="text-xs text-neutral-600 truncate flex-1">{c.name}</span>
                    <Input type="number" className="w-20 h-8 text-xs"
                      value={perBoxOf(box, c.name)}
                      onChange={(e) => setPerBox(i, c.name, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add} className="gap-2">
        <Plus className="w-4 h-4" /> Agregar caja cerrada
      </Button>
    </div>
  );
}

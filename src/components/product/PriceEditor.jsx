import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export default function PriceEditor({ prices, setPrices }) {
  const list = prices || [];

  const update = (i, field, v) =>
    setPrices(list.map((p, idx) => (idx === i ? { ...p, [field]: v } : p)));
  const add = () => setPrices([...list, { name: "", amount: "" }]);
  const remove = (i) => setPrices(list.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {list.length === 0 && (
        <p className="text-xs text-neutral-400">
          Agrega los precios que necesites (ej: “Mayorista”, “A partir de 10”). Todos en PYG.
        </p>
      )}
      {list.map((p, i) => (
        <div key={i} className="flex gap-2 items-end">
          <div className="flex-1">
            <Label>Nombre del precio</Label>
            <Input
              value={p.name}
              onChange={(e) => update(i, "name", e.target.value)}
              placeholder="Ej: Mayorista, A partir de 10"
            />
          </div>
          <div className="w-32">
            <Label>Monto (PYG)</Label>
            <Input
              type="number"
              value={p.amount}
              onChange={(e) => update(i, "amount", e.target.value)}
            />
          </div>
          <Button type="button" variant="outline" size="icon" onClick={() => remove(i)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="gap-2">
        <Plus className="w-4 h-4" /> Agregar precio
      </Button>
    </div>
  );
}

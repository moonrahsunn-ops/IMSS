import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function AccessoryPicker({ selected = [], setSelected, catalog = [] }) {
  const toggle = (a) => {
    const exists = selected.find((s) => s.accessory_id === a.id);
    if (exists) setSelected(selected.filter((s) => s.accessory_id !== a.id));
    else setSelected([...selected, { accessory_id: a.id, name: a.name, image_url: a.image_url, qty: 1 }]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {catalog.length === 0 && <p className="text-sm text-neutral-400">Aún no hay accesorios registrados.</p>}
        {catalog.map((a) => {
          const active = selected.some((s) => s.accessory_id === a.id);
          return (
            <button key={a.id} type="button" onClick={() => toggle(a)}
              className={`px-3 py-1.5 rounded-full text-xs border ${active ? "bg-neutral-900 text-white border-neutral-900" : "bg-white border-neutral-200"}`}>
              {a.name}
            </button>
          );
        })}
      </div>
      {selected.map((s, i) => (
        <div key={s.accessory_id} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden">
            {s.image_url && <Image src={s.image_url} alt={s.name} fittingType="fit" className="w-full h-full" />}
          </div>
          <span className="flex-1 text-sm">{s.name}</span>
          <Input type="number" className="w-20" value={s.qty}
            onChange={(e) => setSelected(selected.map((x, idx) => idx === i ? { ...x, qty: Number(e.target.value || 0) } : x))} />
          <Button variant="ghost" size="icon" onClick={() => setSelected(selected.filter((_, idx) => idx !== i))}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ))}
    </div>
  );
}

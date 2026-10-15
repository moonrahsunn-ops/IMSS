import React, { useEffect, useState } from "react";
import { db } from "@/api/db";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import AppearancePrefs from "@/components/settings/AppearancePrefs";
import ExcelTools from "@/components/settings/ExcelTools";
import BackupTools from "@/components/settings/BackupTools";
import { getSellerName, setSellerName } from "@/lib/settings";

function SimpleList({ title, entityName, placeholder }) {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");

  const load = () => db.entities[entityName].list().then(setItems);
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!name.trim()) return;
    await db.entities[entityName].create({ name: name.trim() });
    setName(""); load();
  };
  const remove = async (i) => { await db.entities[entityName].delete(i.id); load(); };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 space-y-3">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="space-y-1.5">
        {items.length === 0 && <p className="text-sm text-neutral-400">Sin registros.</p>}
        {items.map((i) => (
          <div key={i.id} className="flex items-center gap-2 text-sm border border-neutral-100 rounded-xl px-3 py-2">
            <span className="flex-1">{i.name}</span>
            <Button variant="ghost" size="icon" onClick={() => remove(i)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={placeholder}
          onKeyDown={(e) => e.key === "Enter" && add()} />
        <Button variant="outline" onClick={add}><Plus className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}

function SellerName() {
  const [name, setName] = useState(getSellerName());
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 space-y-3">
      <h3 className="text-sm font-medium">Vendedor</h3>
      <p className="text-xs text-neutral-500">Este nombre aparece en las ventas que registres desde este dispositivo.</p>
      <Input
        value={name}
        placeholder="Tu nombre"
        onChange={(e) => { setName(e.target.value); setSellerName(e.target.value); }}
      />
    </div>
  );
}

export default function Configuration() {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <h1 className="text-lg font-medium">Configuración</h1>
      <SellerName />
      <AppearancePrefs />
      <BackupTools />
      <ExcelTools />
      <div className="grid sm:grid-cols-2 gap-4">
        <SimpleList title="Ubicaciones" entityName="Location" placeholder="Nueva ubicación" />
        <SimpleList title="Tipos de producto" entityName="Category" placeholder="Nueva categoría" />
      </div>
    </div>
  );
}

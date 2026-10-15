import React, { useEffect, useState } from "react";
import { db } from "@/api/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Image } from "@/components/ui/image";
import { Plus, Trash2, Pencil, ImageIcon } from "lucide-react";
import ImageUploadField from "@/components/product/ImageUploadField";
import { gs, totalStock } from "@/lib/format";

const empty = { name: "", code: "", barcode: "", image_url: "", price_wholesale: "", price_retail: "", stock: [] };

export default function Accessories() {
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const load = () => db.entities.Accessory.list("-updated_date").then(setItems);
  useEffect(() => { load(); db.entities.Location.list().then(setLocations); }, []);
  useEffect(() => {
    const u1 = db.entities.Accessory.subscribe(() => load());
    const u2 = db.entities.Location.subscribe(() => db.entities.Location.list().then(setLocations));
    return () => { u1(); u2(); };
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setQty = (loc, qty) => {
    const stock = [...(form.stock || [])];
    const i = stock.findIndex((s) => s.location === loc);
    if (i >= 0) stock[i] = { location: loc, qty: Number(qty || 0) };
    else stock.push({ location: loc, qty: Number(qty || 0) });
    set("stock", stock);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name, code: form.code, barcode: form.barcode, image_url: form.image_url,
      price_wholesale: form.price_wholesale === "" ? undefined : Number(form.price_wholesale),
      price_retail: form.price_retail === "" ? undefined : Number(form.price_retail),
      stock: form.stock || [],
    };
    if (form.id) await db.entities.Accessory.update(form.id, payload);
    else await db.entities.Accessory.create(payload);
    setOpen(false); setForm(empty); load();
  };

  const remove = async (a) => {
    if (!window.confirm(`¿Eliminar "${a.name}"?`)) return;
    await db.entities.Accessory.delete(a.id);
    load();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <h1 className="flex-1 text-lg font-medium">Accesorios</h1>
        <Button className="bg-neutral-900 gap-2" onClick={() => { setForm(empty); setOpen(true); }}>
          <Plus className="w-4 h-4" /> Agregar accesorio
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.length === 0 && <p className="text-sm text-neutral-400">Aún no hay accesorios.</p>}
        {items.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl border border-neutral-200 p-3 flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-neutral-50 overflow-hidden flex items-center justify-center shrink-0">
              {a.image_url ? <Image src={a.image_url} alt={a.name} fittingType="fit" className="w-full h-full" />
                : <ImageIcon className="w-4 h-4 text-neutral-300" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{a.name}</p>
              <p className="text-xs text-neutral-500">{a.code || "sin código"} · Stock {totalStock(a.stock)}</p>
              <p className="text-xs text-neutral-500">{gs(a.price_wholesale)} / {gs(a.price_retail)}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => { setForm({ ...empty, ...a }); setOpen(true); }}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => remove(a)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-auto">
          <DialogHeader><DialogTitle>{form.id ? "Editar accesorio" : "Nuevo accesorio"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <ImageUploadField label="Foto" value={form.image_url} onChange={(v) => set("image_url", v)} />
            <div><Label>Nombre</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Código</Label><Input value={form.code} onChange={(e) => set("code", e.target.value)} /></div>
              <div><Label>Código de barras</Label><Input value={form.barcode} onChange={(e) => set("barcode", e.target.value)} /></div>
              <div><Label>Mayorista</Label><Input type="number" value={form.price_wholesale} onChange={(e) => set("price_wholesale", e.target.value)} /></div>
              <div><Label>Minorista</Label><Input type="number" value={form.price_retail} onChange={(e) => set("price_retail", e.target.value)} /></div>
            </div>
            <div>
              <Label>Stock por ubicación</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {locations.map((l) => (
                  <div key={l.id}>
                    <span className="text-xs text-neutral-500">{l.name}</span>
                    <Input type="number" value={(form.stock || []).find((s) => s.location === l.name)?.qty ?? ""}
                      onChange={(e) => setQty(l.name, e.target.value)} placeholder="0" />
                  </div>
                ))}
              </div>
            </div>
            <Button className="w-full bg-neutral-900" onClick={save}>Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

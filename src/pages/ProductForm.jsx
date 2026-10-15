import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "@/api/db";
import { ChevronLeft, ScanLine } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploadField from "@/components/product/ImageUploadField";
import ColorEditor from "@/components/product/ColorEditor";
import ClosedBoxEditor from "@/components/product/ClosedBoxEditor";
import FeaturesEditor from "@/components/product/FeaturesEditor";
import AccessoryPicker from "@/components/product/AccessoryPicker";
import PriceEditor from "@/components/product/PriceEditor";
import BarcodeScanner from "@/components/BarcodeScanner";

const empty = {
  name: "", main_image: "", extra_images: [], capacity_ml: "", code: "", barcode: "",
  product_type: "", purpose: "", lid_type: "", material: "",
  price_wholesale: "", price_retail: "", prices: [], colors: [], closed_boxes: [], accessories: [], features: [],
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    db.entities.Category.list().then(setCategories);
    db.entities.Location.list().then(setLocations);
    db.entities.Accessory.list().then(setAccessories);
    if (id) {
      db.entities.Product.get(id).then((p) => {
        if (!p) return;
        const f = { ...empty, ...p };
        if (!(f.prices || []).length && (f.price_wholesale || f.price_retail)) {
          f.prices = [];
          if (f.price_wholesale) f.prices.push({ name: "Mayorista", amount: f.price_wholesale });
          if (f.price_retail) f.prices.push({ name: "Minorista", amount: f.price_retail });
        }
        setForm(f);
      });
    }
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const num = (v) => (v === "" || v === null || v === undefined ? undefined : Number(v));
      const payload = {
        ...form,
        capacity_ml: num(form.capacity_ml),
        price_wholesale: num(form.price_wholesale),
        price_retail: num(form.price_retail),
        prices: (form.prices || []).map((p) => ({ name: p.name, amount: num(p.amount) })),
        closed_boxes: (form.closed_boxes || []).map((b) => ({
          name: b.name || "",
          units_per_box: num(b.units_per_box),
          quantity: num(b.quantity),
          location: b.location || "",
          colors: (b.colors || []).map((c) => ({ name: c.name, per_box: num(c.per_box) })),
        })),
      };
      delete payload.id; delete payload.created_date; delete payload.updated_date;
      if (id) {
        await db.entities.Product.update(id, payload);
        navigate(`/producto/${id}`);
      } else {
        const p = await db.entities.Product.create(payload);
        navigate(`/producto/${p.id}`);
      }
    } catch (e) {
      alert("No se pudo guardar: " + (e?.message || e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <Link to={id ? `/producto/${id}` : "/"} className="p-2 -ml-2 rounded-lg hover:bg-neutral-100"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="flex-1 text-sm font-medium">{id ? "Editar producto" : "Agregar producto"}</h1>
        <Button className="bg-neutral-900" disabled={saving} onClick={save}>{saving ? "Guardando..." : "Guardar"}</Button>
      </div>

      <section className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6 space-y-4">
        <ImageUploadField label="Foto principal" value={form.main_image} onChange={(v) => set("main_image", v)} />
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Nombre</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div><Label>Capacidad (ml)</Label><Input type="number" value={form.capacity_ml} onChange={(e) => set("capacity_ml", e.target.value)} /></div>
          <div><Label>Código</Label><Input value={form.code} onChange={(e) => set("code", e.target.value)} /></div>
          <div>
            <Label>Código de barras</Label>
            <div className="flex gap-2">
              <Input value={form.barcode} onChange={(e) => set("barcode", e.target.value)} />
              <Button type="button" variant="outline" onClick={() => setScanning(true)}><ScanLine className="w-4 h-4" /></Button>
            </div>
          </div>
          <div>
            <Label>Tipo de producto</Label>
            <Select value={form.product_type} onValueChange={(v) => set("product_type", v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Para qué sirve</Label><Input value={form.purpose} onChange={(e) => set("purpose", e.target.value)} /></div>
          <div><Label>Tipo de tapa</Label><Input value={form.lid_type} onChange={(e) => set("lid_type", e.target.value)} /></div>
          <div><Label>Material</Label><Input value={form.material} onChange={(e) => set("material", e.target.value)} /></div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6">
        <h3 className="text-sm font-medium mb-4">Precios (PYG)</h3>
        <PriceEditor prices={form.prices || []} setPrices={(p) => set("prices", p)} />
      </section>

      <section className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6">
        <h3 className="text-sm font-medium mb-4">Colores y stock por ubicación</h3>
        <ColorEditor colors={form.colors || []} setColors={(c) => set("colors", c)} locations={locations} />
      </section>

      <section className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6">
        <h3 className="text-sm font-medium mb-4">Cajas cerradas</h3>
        <ClosedBoxEditor boxes={form.closed_boxes || []} setBoxes={(b) => set("closed_boxes", b)} colors={form.colors || []} locations={locations} />
      </section>

      <section className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6">
        <h3 className="text-sm font-medium mb-4">Accesorios incluidos</h3>
        <AccessoryPicker selected={form.accessories || []} setSelected={(a) => set("accessories", a)} catalog={accessories} />
      </section>

      <section className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-6">
        <h3 className="text-sm font-medium mb-4">Características</h3>
        <FeaturesEditor features={form.features || []} setFeatures={(f) => set("features", f)} />
      </section>

      <BarcodeScanner open={scanning} onClose={() => setScanning(false)}
        onDetected={(code) => { set("barcode", code); setScanning(false); }} />
    </div>
  );
}

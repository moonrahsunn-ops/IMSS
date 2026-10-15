import React, { useState } from "react";
import { db } from "@/api/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { gs, totalStock, getPrices } from "@/lib/format";
import ScrollArea from "@/components/sales/ScrollArea";

const boxPerBox = (b) => {
  const sum = (b.colors || []).reduce((s, c) => s + Number(c.per_box || 0), 0);
  return sum || Number(b.units_per_box || 0);
};

export default function SellDialog({ open, onClose, products, locations, onSold, currentUser }) {
  const [mode, setMode] = useState("unidad");
  const [productId, setProductId] = useState("");
  const [color, setColor] = useState("");
  const [location, setLocation] = useState("");
  const [boxIdx, setBoxIdx] = useState("");
  const [boxesToOpen, setBoxesToOpen] = useState(1);
  const [extract, setExtract] = useState({});
  const [destLocation, setDestLocation] = useState("");
  const [qty, setQty] = useState(1);
  const [priceName, setPriceName] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const product = products.find((p) => p.id === productId);
  const prices = getPrices(product);
  const unitPrice = (prices.find((p) => p.name === priceName) || {}).amount || 0;

  const colorObj = (product?.colors || []).find((c) => c.name === color);
  const available = Number((colorObj?.stock || []).find((s) => s.location === location)?.qty || 0);

  const boxes = (product?.closed_boxes || [])
    .map((b, i) => ({ ...b, _i: i }))
    .filter((b) => Number(b.quantity || 0) > 0);
  const box = mode !== "unidad" ? boxes.find((b) => String(b._i) === String(boxIdx)) : null;
  const perBox = box ? boxPerBox(box) : 0;
  const boxAvailable = box ? Number(box.quantity || 0) : 0;

  const openCount = Math.min(Number(boxesToOpen || 0), boxAvailable);
  const totalExtracted = box
    ? (box.colors || []).reduce((s, c) => s + Number(extract[c.name] || 0), 0)
    : 0;
  const totalUnits =
    mode === "caja" ? perBox * Number(qty || 0)
    : mode === "desarmar" ? totalExtracted
    : Number(qty || 0);
  const totalAmount = Number(unitPrice || 0) * totalUnits;

  const reset = () => {
    setProductId(""); setColor(""); setLocation(""); setBoxIdx("");
    setBoxesToOpen(1); setExtract({}); setDestLocation("");
    setQty(1); setPriceName(""); setNote(""); setError(""); setMode("unidad");
  };

  const submit = async () => {
    setError("");
    if (!product) return setError("Selecciona un producto.");
    if (prices.length && !priceName) return setError("Selecciona un precio.");
    setSaving(true);
    try {
      if (mode === "caja") {
        if (!box) return setError("Selecciona una caja cerrada.");
        if (qty < 1 || qty > boxAvailable) return setError(`Cajas insuficientes (disponibles: ${boxAvailable}).`);
        const closed_boxes = product.closed_boxes
          .map((b, i) => (i === box._i ? { ...b, quantity: Number(b.quantity || 0) - Number(qty) } : b))
          .filter((b) => Number(b.quantity || 0) > 0);
        await db.entities.Product.update(product.id, { closed_boxes });
        const breakdown = (box.colors || []).map((c) => `${c.name}: ${c.per_box}`).join(", ");
        await db.entities.Sale.create({
          item_type: "product", product_id: product.id, product_name: product.name,
          color: "Caja cerrada", quantity: totalUnits, unit_price: Number(unitPrice || 0),
          price_type: priceName, location: box.location || "", total: totalAmount,
          user_name: currentUser?.full_name || currentUser?.email || "—",
          note: `${note ? note + " | " : ""}Caja cerrada (${perBox} uds) x${qty}${breakdown ? " — " + breakdown : ""}`,
          sold_at: new Date().toISOString(),
        });
      } else if (mode === "desarmar") {
        if (!box) return setError("Selecciona una caja cerrada.");
        if (openCount < 1) return setError("Indica cuántas cajas abrir.");
        if (totalExtracted < 1) return setError("Indica cuántas unidades vender.");
        if (!destLocation) return setError("Selecciona la ubicación para el sobrante.");
        for (const c of (box.colors || [])) {
          const ex = Number(extract[c.name] || 0);
          const max = Number(c.per_box || 0) * openCount;
          if (ex > max) return setError(`${c.name}: máximo ${max} unidades.`);
        }
        let closed_boxes = product.closed_boxes.map((b, i) =>
          i === box._i ? { ...b, quantity: Number(b.quantity || 0) - openCount } : b
        );
        closed_boxes = closed_boxes.filter((b) => Number(b.quantity || 0) > 0);
        const colors = (product.colors || []).map((c) => {
          const perBoxC = Number((box.colors || []).find((x) => x.name === c.name)?.per_box || 0);
          if (!perBoxC) return c;
          const leftover = perBoxC * openCount - Number(extract[c.name] || 0);
          if (leftover <= 0) return c;
          const stock = (c.stock || []).slice();
          const idx = stock.findIndex((s) => s.location === destLocation);
          if (idx >= 0) stock[idx] = { ...stock[idx], qty: Number(stock[idx].qty || 0) + leftover };
          else stock.push({ location: destLocation, qty: leftover });
          return { ...c, stock };
        });
        await db.entities.Product.update(product.id, { closed_boxes, colors });
        const breakdown = (box.colors || []).map((c) => `${c.name}: ${extract[c.name] || 0}`).join(", ");
        await db.entities.Sale.create({
          item_type: "product", product_id: product.id, product_name: product.name,
          color: "Caja desarmada", quantity: totalExtracted, unit_price: Number(unitPrice || 0),
          price_type: priceName, location: box.location || "", total: totalAmount,
          user_name: currentUser?.full_name || currentUser?.email || "—",
          note: `${note ? note + " | " : ""}Desarmada ${openCount} caja(s) · vendido: ${breakdown} · sobrante a ${destLocation}`,
          sold_at: new Date().toISOString(),
        });
      } else {
        if (!colorObj || !location) return setError("Completa color y ubicación.");
        if (qty < 1 || qty > available) return setError(`Stock insuficiente (disponible: ${available}).`);
        const colors = product.colors.map((c) =>
          c.name !== color ? c : {
            ...c,
            stock: (c.stock || []).map((s) => (s.location === location ? { ...s, qty: s.qty - qty } : s)),
          });
        await db.entities.Product.update(product.id, { colors });
        await db.entities.Sale.create({
          item_type: "product", product_id: product.id, product_name: product.name,
          color, quantity: Number(qty), unit_price: Number(unitPrice || 0),
          price_type: priceName, location, total: Number(unitPrice || 0) * Number(qty),
          user_name: currentUser?.full_name || currentUser?.email || "—", note,
          sold_at: new Date().toISOString(),
        });
      }
      onSold();
      onClose();
      reset();
    } catch (e) {
      setError(e?.message || "Error al registrar la venta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); reset(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Registrar venta</DialogTitle></DialogHeader>
        <ScrollArea className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-3 gap-2">
            <Button type="button" size="sm" variant={mode === "unidad" ? "default" : "outline"} onClick={() => setMode("unidad")}>Unidad</Button>
            <Button type="button" size="sm" variant={mode === "caja" ? "default" : "outline"} onClick={() => setMode("caja")}>Caja</Button>
            <Button type="button" size="sm" variant={mode === "desarmar" ? "default" : "outline"} onClick={() => setMode("desarmar")}>Desarmar</Button>
          </div>

          <div>
            <Label>Producto</Label>
            <Select
              value={productId}
              onValueChange={(v) => {
                setProductId(v); setColor(""); setBoxIdx(""); setExtract({}); setBoxesToOpen(1);
                const p = products.find((x) => x.id === v);
                const pr = getPrices(p);
                setPriceName(pr.length ? pr[0].name : "");
              }}
            >
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-neutral-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {p.main_image
                          ? <img src={p.main_image} alt="" className="w-full h-full object-cover" />
                          : <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />}
                      </span>
                      <span className="truncate">{p.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mode === "unidad" && (
            <>
              <div>
                <Label>Color</Label>
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {(product?.colors || []).map((c) => {
                      const img = c.image_url || (c.images || [])[0];
                      return (
                        <SelectItem key={c.name} value={c.name}>
                          <span className="flex items-center gap-2">
                            <span className="truncate">{c.name} ({totalStock(c.stock)})</span>
                            <span
                              className="w-5 h-5 rounded-full overflow-hidden border border-neutral-200 shrink-0"
                              style={img ? undefined : { background: c.hex || "#e5e5e5" }}
                            >
                              {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                            </span>
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ubicación</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {locations.map((l) => <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {location && <p className="text-xs text-neutral-500 mt-1">Disponible: {available}</p>}
              </div>
              <div>
                <Label>Cantidad</Label>
                <Input type="number" min="1" value={qty} onChange={(e) => setQty(Number(e.target.value || 1))} />
              </div>
            </>
          )}

          {mode === "caja" && (
            <>
              <div>
                <Label>Caja cerrada</Label>
                <Select value={boxIdx} onValueChange={setBoxIdx}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {boxes.length === 0 && <SelectItem value="_none" disabled>Sin cajas disponibles</SelectItem>}
                    {boxes.map((b) => (
                      <SelectItem key={b._i} value={String(b._i)}>
                        <span className="flex items-baseline gap-2">
                          <span className="font-semibold truncate">{b.name || "Caja sin nombre"}</span>
                          <span className="text-neutral-400 text-xs truncate">
                            {boxPerBox(b)} uds · {b.location || "—"} · {b.quantity} cajas
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {box && <p className="text-xs text-neutral-500 mt-1">Disponibles: {boxAvailable} cajas · {perBox} uds cada una</p>}
              </div>
              <div>
                <Label>Cantidad de cajas</Label>
                <Input type="number" min="1" max={boxAvailable} value={qty} onChange={(e) => setQty(Number(e.target.value || 1))} />
              </div>
              {box && <p className="text-xs text-neutral-500">Total unidades: {totalUnits}</p>}
            </>
          )}

          {mode === "desarmar" && (
            <>
              <div>
                <Label>Caja a desarmar</Label>
                <Select value={boxIdx} onValueChange={(v) => { setBoxIdx(v); setExtract({}); setBoxesToOpen(1); }}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {boxes.length === 0 && <SelectItem value="_none" disabled>Sin cajas disponibles</SelectItem>}
                    {boxes.map((b) => (
                      <SelectItem key={b._i} value={String(b._i)}>
                        <span className="flex items-baseline gap-2">
                          <span className="font-semibold truncate">{b.name || "Caja sin nombre"}</span>
                          <span className="text-neutral-400 text-xs truncate">
                            {boxPerBox(b)} uds · {b.location || "—"} · {b.quantity} cajas
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {box && (
                <>
                  <div>
                    <Label>Cajas a abrir</Label>
                    <Input type="number" min="1" max={boxAvailable} value={boxesToOpen} onChange={(e) => setBoxesToOpen(Number(e.target.value || 1))} />
                    <p className="text-xs text-neutral-500 mt-1">Abriendo {openCount} caja(s) de {box.location || "—"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Unidades a vender por color</Label>
                    {(box.colors || []).map((c) => {
                      const max = Number(c.per_box || 0) * openCount;
                      const pc = (product?.colors || []).find((x) => x.name === c.name);
                      const img = pc?.image_url || (pc?.images || [])[0];
                      return (
                        <div key={c.name} className="flex items-center gap-2">
                          <span className="flex-1 text-sm">
                            {c.name} <span className="text-xs text-neutral-400">(disp: {max})</span>
                          </span>
                          <span
                            className="w-5 h-5 rounded-full overflow-hidden border border-neutral-200 shrink-0"
                            style={img ? undefined : { background: pc?.hex || "#e5e5e5" }}
                          >
                            {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                          </span>
                          <Input
                            type="number"
                            min="0"
                            max={max}
                            value={extract[c.name] ?? ""}
                            onChange={(e) => setExtract({ ...extract, [c.name]: Number(e.target.value || 0) })}
                            className="w-24"
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <Label>Ubicación para el sobrante</Label>
                    <Select value={destLocation} onValueChange={setDestLocation}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {locations.map((l) => <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-neutral-500">A vender: {totalExtracted} uds · Sobrante a {destLocation || "—"}</p>
                </>
              )}
            </>
          )}

          <div>
            <Label>Precio</Label>
            <Select value={priceName} onValueChange={setPriceName}>
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                {prices.map((p) => (
                  <SelectItem key={p.name} value={p.name}>{p.name} · {gs(p.amount)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Nota</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Opcional" />
          </div>

          <div className="flex justify-between text-sm pt-1">
            <span className="text-neutral-500">Total</span>
            <span className="font-medium">{gs(totalAmount)}</span>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button className="w-full bg-neutral-900" disabled={saving} onClick={submit}>
            {saving ? "Guardando..." : "Registrar venta"}
          </Button>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

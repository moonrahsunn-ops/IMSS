import React, { useState } from "react";
import { db } from "@/api/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ScrollArea from "@/components/sales/ScrollArea";

export default function TransferDialog({ open, onClose, products, locations, onDone }) {
  const [productId, setProductId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [qtys, setQtys] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const product = products.find((p) => p.id === productId);
  const colors = (product?.colors || []).filter((c) =>
    (c.stock || []).some((s) => s.location === from && Number(s.qty || 0) > 0)
  );

  const reset = () => {
    setProductId(""); setFrom(""); setTo(""); setQtys({}); setError("");
  };

  const submit = async () => {
    setError("");
    if (!product) return setError("Selecciona un producto.");
    if (!from || !to) return setError("Selecciona origen y destino.");
    if (from === to) return setError("El origen y destino deben ser distintos.");
    const moves = (product.colors || [])
      .map((c) => ({ name: c.name, qty: Number(qtys[c.name] || 0) }))
      .filter((m) => m.qty > 0);
    if (moves.length === 0) return setError("Indica al menos una cantidad a mudar.");
    for (const m of moves) {
      const c = product.colors.find((x) => x.name === m.name);
      const avail = Number((c.stock || []).find((s) => s.location === from)?.qty || 0);
      if (m.qty > avail) return setError(`${m.name}: disponible ${avail} en ${from}.`);
    }
    setSaving(true);
    try {
      const colors = product.colors.map((c) => {
        const move = Number(qtys[c.name] || 0);
        if (!move) return c;
        const stock = (c.stock || []).map((s) =>
          s.location === from ? { ...s, qty: Number(s.qty || 0) - move } : s
        );
        const idx = stock.findIndex((s) => s.location === to);
        if (idx >= 0) stock[idx] = { ...stock[idx], qty: Number(stock[idx].qty || 0) + move };
        else stock.push({ location: to, qty: move });
        return { ...c, stock };
      });
      await db.entities.Product.update(product.id, { colors });
      onDone?.();
      onClose();
      reset();
    } catch (e) {
      setError(e?.message || "Error al mudar el stock.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); reset(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Mudar stock</DialogTitle></DialogHeader>
        <ScrollArea className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
          <div>
            <Label>Producto</Label>
            <Select value={productId} onValueChange={(v) => { setProductId(v); setQtys({}); }}>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Desde</Label>
              <Select value={from} onValueChange={(v) => { setFrom(v); setQtys({}); }}>
                <SelectTrigger><SelectValue placeholder="Origen" /></SelectTrigger>
                <SelectContent>
                  {locations.map((l) => <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Hacia</Label>
              <Select value={to} onValueChange={setTo}>
                <SelectTrigger><SelectValue placeholder="Destino" /></SelectTrigger>
                <SelectContent>
                  {locations.map((l) => <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {from && (
            <div className="space-y-2">
              <Label>Colores y cantidades a mudar</Label>
              {colors.length === 0 && (
                <p className="text-xs text-neutral-400">Sin stock disponible en {from}.</p>
              )}
              {colors.map((c) => {
                const avail = Number((c.stock || []).find((s) => s.location === from)?.qty || 0);
                const img = c.image_url || (c.images || [])[0];
                return (
                  <div key={c.name} className="flex items-center gap-2">
                    <span className="flex-1 text-sm">
                      {c.name} <span className="text-xs text-neutral-400">(disp: {avail})</span>
                    </span>
                    <span
                      className="w-5 h-5 rounded-full overflow-hidden border border-neutral-200 shrink-0"
                      style={img ? undefined : { background: c.hex || "#e5e5e5" }}
                    >
                      {img && <img src={img} alt="" className="w-full h-full object-cover" />}
                    </span>
                    <Input
                      type="number"
                      min="0"
                      max={avail}
                      value={qtys[c.name] ?? ""}
                      onChange={(e) => setQtys({ ...qtys, [c.name]: Number(e.target.value || 0) })}
                      className="w-24"
                    />
                  </div>
                );
              })}
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button className="w-full bg-neutral-900" disabled={saving} onClick={submit}>
            {saving ? "Mudando..." : "Mudar"}
          </Button>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

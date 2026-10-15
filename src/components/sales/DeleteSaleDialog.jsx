import React, { useState } from "react";
import { db } from "@/api/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DeleteSaleDialog({ sale, products, onClose, onDone }) {
  const [busy, setBusy] = useState(false);
  const open = !!sale;

  const restorable =
    sale &&
    sale.item_type === "product" &&
    sale.product_id &&
    sale.color &&
    sale.location &&
    sale.color !== "Caja cerrada" &&
    sale.color !== "Caja desarmada" &&
    products.some(
      (p) => p.id === sale.product_id && (p.colors || []).some((c) => c.name === sale.color)
    );

  const run = async (restore) => {
    setBusy(true);
    try {
      if (restore && restorable) {
        const product = products.find((p) => p.id === sale.product_id);
        const colors = (product.colors || []).map((c) => {
          if (c.name !== sale.color) return c;
          const stock = (c.stock || []).slice();
          const idx = stock.findIndex((s) => s.location === sale.location);
          if (idx >= 0)
            stock[idx] = { ...stock[idx], qty: Number(stock[idx].qty || 0) + Number(sale.quantity || 0) };
          else stock.push({ location: sale.location, qty: Number(sale.quantity || 0) });
          return { ...c, stock };
        });
        await db.entities.Product.update(product.id, { colors });
      }
      await db.entities.Sale.delete(sale.id);
      onDone();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Eliminar venta</DialogTitle></DialogHeader>
        {sale && (
          <div className="space-y-3">
            <p className="text-sm text-neutral-600">
              {sale.product_name} · {sale.quantity} u · {sale.color}
            </p>
            {restorable ? (
              <p className="text-sm text-neutral-600">¿Querés devolver los productos al inventario?</p>
            ) : (
              <p className="text-sm text-neutral-600">
                Esta venta no se puede devolver automáticamente al inventario. ¿Eliminar el registro de todos modos?
              </p>
            )}
            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="outline" onClick={onClose} disabled={busy}>Cancelar</Button>
              {restorable && (
                <Button variant="outline" onClick={() => run(false)} disabled={busy}>
                  No, solo eliminar
                </Button>
              )}
              <Button className="bg-neutral-900" onClick={() => run(restorable)} disabled={busy}>
                {busy ? "Eliminando..." : restorable ? "Sí, devolver" : "Eliminar"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

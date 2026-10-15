import React, { useEffect, useState } from "react";
import { db } from "@/api/db";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeftRight, Trash2 } from "lucide-react";
import SellDialog from "@/components/sales/SellDialog";
import TransferDialog from "@/components/sales/TransferDialog";
import DeleteSaleDialog from "@/components/sales/DeleteSaleDialog";
import { gs } from "@/lib/format";
import { getSellerName } from "@/lib/settings";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [open, setOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = () => db.entities.Sale.list("-sold_at", 100).then(setSales);
  useEffect(() => {
    load();
    db.entities.Product.list().then(setProducts);
    db.entities.Location.list().then(setLocations);
  }, []);
  useEffect(() => {
    const u1 = db.entities.Sale.subscribe(() => load());
    const u2 = db.entities.Product.subscribe(() => db.entities.Product.list().then(setProducts));
    const u3 = db.entities.Location.subscribe(() => db.entities.Location.list().then(setLocations));
    return () => { u1(); u2(); u3(); };
  }, []);

  const refresh = () => { load(); db.entities.Product.list().then(setProducts); };
  const refreshStock = () => db.entities.Product.list().then(setProducts);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <h1 className="flex-1 text-lg font-medium">Ventas</h1>
        <Button variant="outline" className="gap-2" onClick={() => setTransferOpen(true)}>
          <ArrowLeftRight className="w-4 h-4" /> Mudar
        </Button>
        <Button className="bg-neutral-900 gap-2" onClick={() => setOpen(true)}>
          <ShoppingCart className="w-4 h-4" /> Vender
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {sales.length === 0 ? (
          <p className="p-6 text-sm text-neutral-400">Aún no hay ventas registradas.</p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {sales.map((s) => (
              <div key={s.id} className="p-4 flex flex-wrap items-center gap-2 text-sm">
                <div className="flex-1 min-w-[180px]">
                  <p className="font-medium">{s.product_name} {s.color && <span className="text-neutral-500">· {s.color}</span>}</p>
                  <p className="text-xs text-neutral-500">
                    {s.quantity} u · {s.price_type} · {s.location} · {s.user_name}
                  </p>
                  {s.note && <p className="text-xs text-neutral-400">{s.note}</p>}
                </div>
                <div className="text-right">
                  <p className="font-medium">{gs(s.total)}</p>
                  <p className="text-xs text-neutral-400">
                    {s.sold_at ? new Date(s.sold_at).toLocaleString("es-PY") : ""}
                  </p>
                </div>
                <button
                  onClick={() => setToDelete(s)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-neutral-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <SellDialog open={open} onClose={() => setOpen(false)} products={products}
        locations={locations} onSold={refresh} currentUser={{ full_name: getSellerName() }} />
      <TransferDialog open={transferOpen} onClose={() => setTransferOpen(false)}
        products={products} locations={locations} onDone={refreshStock} />
      <DeleteSaleDialog
        sale={toDelete}
        products={products}
        onClose={() => setToDelete(null)}
        onDone={refresh}
      />
    </div>
  );
}

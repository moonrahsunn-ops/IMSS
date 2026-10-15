import React, { useEffect, useMemo, useState } from "react";
import { db } from "@/api/db";
import { gs, productStock } from "@/lib/format";

const Card = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5">
    <h3 className="text-sm font-medium mb-3">{title}</h3>
    {children}
  </div>
);

const List = ({ rows, empty }) =>
  rows.length === 0 ? <p className="text-sm text-neutral-400">{empty}</p> : (
    <ul className="space-y-1.5 text-sm">
      {rows.map((r, i) => (
        <li key={i} className="flex justify-between gap-3">
          <span className="truncate text-neutral-700">{r[0]}</span>
          <span className="text-neutral-900 font-medium shrink-0">{r[1]}</span>
        </li>
      ))}
    </ul>
  );

export default function Reports() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [days, setDays] = useState(30);

  useEffect(() => {
    db.entities.Product.list().then(setProducts);
    db.entities.Sale.list("-sold_at", 500).then(setSales);
  }, []);
  useEffect(() => {
    const u1 = db.entities.Product.subscribe(() => db.entities.Product.list().then(setProducts));
    const u2 = db.entities.Sale.subscribe(() => db.entities.Sale.list("-sold_at", 500).then(setSales));
    return () => { u1(); u2(); };
  }, []);

  const periodSales = useMemo(() => {
    const from = Date.now() - days * 86400000;
    return sales.filter((s) => new Date(s.sold_at || s.created_date).getTime() >= from);
  }, [sales, days]);

  const group = (key, valueFn = (s) => s.quantity) => {
    const map = {};
    periodSales.forEach((s) => { map[s[key] || "—"] = (map[s[key] || "—"] || 0) + Number(valueFn(s) || 0); });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  };

  const totalStock = products.reduce((s, p) => s + productStock(p), 0);
  const low = products.filter((p) => productStock(p) > 0 && productStock(p) <= 3);
  const out = products.filter((p) => productStock(p) === 0);
  const revenue = periodSales.reduce((s, x) => s + Number(x.total || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="flex-1 text-lg font-medium">Reportes</h1>
        {[7, 30, 90, 365].map((d) => (
          <button key={d} onClick={() => setDays(d)}
            className={`px-3 py-1.5 rounded-full text-xs border ${days === d ? "bg-neutral-900 text-white border-neutral-900" : "bg-white border-neutral-200"}`}>
            {d} días
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[["Stock total", totalStock], ["Poco stock", low.length], ["Sin stock", out.length], ["Ventas", periodSales.length]].map(([t, v]) => (
          <div key={t} className="bg-white rounded-2xl border border-neutral-200 p-4">
            <p className="text-xs text-neutral-500">{t}</p>
            <p className="text-2xl font-medium mt-1">{v}</p>
          </div>
        ))}
      </div>

      <Card title={`Facturado en ${days} días`}>
        <p className="text-2xl font-medium">{gs(revenue)}</p>
      </Card>

      <div className="grid sm:grid-cols-2 gap-3">
        <Card title="Productos más vendidos">
          <List rows={group("product_name").map(([k, v]) => [k, `${v} u`])} empty="Sin ventas en el período." />
        </Card>
        <Card title="Ventas por vendedor">
          <List rows={group("user_name", (s) => s.total).map(([k, v]) => [k, gs(v)])} empty="Sin ventas en el período." />
        </Card>
        <Card title="Ventas por ubicación">
          <List rows={group("location", (s) => s.total).map(([k, v]) => [k, gs(v)])} empty="Sin ventas en el período." />
        </Card>
        <Card title="Productos con poco stock">
          <List rows={low.map((p) => [p.name, productStock(p)])} empty="Todo con stock suficiente." />
        </Card>
        <Card title="Productos sin stock">
          <List rows={out.map((p) => [p.name, 0])} empty="Ningún producto sin stock." />
        </Card>
        <Card title="Movimiento de inventario (últimas ventas)">
          <List rows={periodSales.slice(0, 10).map((s) => [
            `${s.product_name} ${s.color || ""} · ${s.location || ""}`, `-${s.quantity}`,
          ])} empty="Sin movimientos." />
        </Card>
      </div>
    </div>
  );
}

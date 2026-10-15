import React, { useEffect, useMemo, useState } from "react";
import { db } from "@/api/db";
import ProductCard from "@/components/inventory/ProductCard";
import InventoryToolbar from "@/components/inventory/InventoryToolbar";
import BarcodeScanner from "@/components/BarcodeScanner";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [scanning, setScanning] = useState(false);

  const load = async () => {
    const list = await db.entities.Product.list("-updated_date");
    setProducts(list);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => db.entities.Product.subscribe(() => load()), []);

  const options = useMemo(() => ({
    mls: [...new Set(products.map((p) => p.capacity_ml).filter(Boolean))].sort((a, b) => a - b),
    colors: [...new Set(products.flatMap((p) => (p.colors || []).map((c) => c.name)).filter(Boolean))],
    accessories: [...new Set(products.flatMap((p) => (p.accessories || []).map((a) => a.name)).filter(Boolean))],
    lids: [...new Set(products.map((p) => p.lid_type).filter(Boolean))],
    purposes: [...new Set(products.map((p) => p.purpose).filter(Boolean))],
  }), [products]);

  const filtered = products.filter((p) => {
    const q = query.trim().toLowerCase();
    const matchQ = !q || [p.name, p.code, p.barcode, p.product_type, ...(p.colors || []).map((c) => c.name)]
      .filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
    const matchF = Object.entries(filters).every(([k, v]) => {
      if (!v) return true;
      if (k === "color") return (p.colors || []).some((c) => c.name === v);
      if (k === "accessory") return (p.accessories || []).some((a) => a.name === v);
      return String(p[k] || "") === String(v);
    });
    return matchQ && matchF;
  });

  const handleDelete = async (product) => {
    if (!window.confirm(`¿Eliminar "${product.name}"?`)) return;
    await db.entities.Product.delete(product.id);
    load();
  };

  return (
    <div className="space-y-5">
      <InventoryToolbar
        query={query} setQuery={setQuery}
        filters={filters} setFilters={setFilters}
        options={options}
        onScan={() => setScanning(true)}
      />

      {loading ? (
        <p className="text-sm text-neutral-400">Cargando productos...</p>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-neutral-400">No hay productos que coincidan.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((p) => <ProductCard key={p.id} product={p} onDelete={handleDelete} />)}
        </div>
      )}

      <p className="text-center text-xs text-neutral-400">
        Mostrando {filtered.length} de {products.length} productos
      </p>

      <BarcodeScanner
        open={scanning}
        onClose={() => setScanning(false)}
        onDetected={(code) => { setQuery(code); setScanning(false); }}
      />
    </div>
  );
}

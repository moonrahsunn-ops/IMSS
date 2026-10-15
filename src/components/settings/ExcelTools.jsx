import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { db } from "@/api/db";
import { Button } from "@/components/ui/button";
import { Download, Upload, Loader2 } from "lucide-react";
import { productTotalStock, getPrices } from "@/lib/format";

export default function ExcelTools() {
  const [busy, setBusy] = useState(null);
  const fileRef = useRef(null);

  const exportExcel = async () => {
    setBusy("export");
    const products = await db.entities.Product.list("-updated_date");
    const rows = products.map((p) => {
      const prices = getPrices(p);
      return {
        Nombre: p.name || "",
        Código: p.code || "",
        Barcode: p.barcode || "",
        "Capacidad (ml)": p.capacity_ml || "",
        Tipo: p.product_type || "",
        Uso: p.purpose || "",
        Tapa: p.lid_type || "",
        Material: p.material || "",
        "Precio 1": prices[0]?.amount ?? "",
        "Nombre precio 1": prices[0]?.name ?? "",
        "Precio 2": prices[1]?.amount ?? "",
        "Nombre precio 2": prices[1]?.name ?? "",
        Stock: productTotalStock(p),
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    XLSX.writeFile(wb, "inventario.xlsx");
    setBusy(null);
  };

  const importExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy("import");
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws);
      const toCreate = rows.map((r) => {
        const name = String(r.Nombre || r.name || "").trim();
        if (!name) return null;
        const prices = [];
        if (r["Precio 1"] !== undefined && r["Precio 1"] !== "") {
          prices.push({ name: String(r["Nombre precio 1"] || "Precio 1"), amount: Number(r["Precio 1"]) });
        }
        if (r["Precio 2"] !== undefined && r["Precio 2"] !== "") {
          prices.push({ name: String(r["Nombre precio 2"] || "Precio 2"), amount: Number(r["Precio 2"]) });
        }
        return {
          name,
          code: String(r.Código || r.code || ""),
          barcode: String(r.Barcode || r.barcode || ""),
          capacity_ml: r["Capacidad (ml)"] ? Number(r["Capacidad (ml)"]) : undefined,
          product_type: String(r.Tipo || ""),
          purpose: String(r.Uso || ""),
          lid_type: String(r.Tapa || ""),
          material: String(r.Material || ""),
          prices,
        };
      }).filter(Boolean);
      if (toCreate.length) await db.entities.Product.bulkCreate(toCreate);
      alert(`${toCreate.length} productos importados.`);
    } catch (err) {
      alert("Error al importar: " + (err?.message || err));
    }
    setBusy(null);
    e.target.value = "";
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 space-y-3">
      <h3 className="text-sm font-medium">Importar / Exportar Excel</h3>
      <p className="text-xs text-neutral-500">Exportá el inventario a un archivo Excel o importá productos desde un Excel (.xlsx).</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={exportExcel} disabled={!!busy} className="gap-2">
          {busy === "export" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Exportar
        </Button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={importExcel} />
        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={!!busy} className="gap-2">
          {busy === "import" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Importar
        </Button>
      </div>
    </div>
  );
}

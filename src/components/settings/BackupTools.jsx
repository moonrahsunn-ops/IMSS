import React, { useRef, useState } from "react";
import { exportBackup, importBackup } from "@/api/db";
import { Button } from "@/components/ui/button";
import { Download, Upload, Loader2 } from "lucide-react";

export default function BackupTools() {
  const [busy, setBusy] = useState(null);
  const fileRef = useRef(null);

  const doExport = async () => {
    setBusy("export");
    try {
      const backup = await exportBackup();
      const blob = new Blob([JSON.stringify(backup)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `respaldo-inventario-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("No se pudo crear el respaldo: " + (err?.message || err));
    }
    setBusy(null);
  };

  const doImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!window.confirm("Esto reemplaza TODOS los datos actuales por los del respaldo. ¿Continuar?")) return;
    setBusy("import");
    try {
      await importBackup(JSON.parse(await file.text()));
      alert("Respaldo restaurado.");
    } catch (err) {
      alert("Error al restaurar: " + (err?.message || err));
    }
    setBusy(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 space-y-3">
      <h3 className="text-sm font-medium">Respaldo</h3>
      <p className="text-xs text-neutral-500">
        Los datos se guardan solo en este navegador. Descargá un respaldo para guardarlos o pasarlos a otro dispositivo.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={doExport} disabled={!!busy} className="gap-2">
          {busy === "export" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Descargar respaldo
        </Button>
        <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={doImport} />
        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={!!busy} className="gap-2">
          {busy === "import" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Restaurar respaldo
        </Button>
      </div>
    </div>
  );
}

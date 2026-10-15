import React, { useState } from "react";
import { fileToDataUrl } from "@/lib/images";
import { Image } from "@/components/ui/image";
import { Loader2, Upload, X } from "lucide-react";

export default function ImageUploadField({ label = "Foto", value, onChange }) {
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      onChange(await fileToDataUrl(file));
    } catch {
      alert("No se pudo cargar la imagen.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-16 h-16 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center shrink-0">
        {loading ? <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
          : value ? <Image src={value} alt={label} fittingType="fit" className="w-full h-full" />
          : <Upload className="w-4 h-4 text-neutral-300" />}
      </div>
      <div className="text-sm">
        <label className="cursor-pointer text-neutral-700 underline">
          {label}
          <input type="file" accept="image/*" className="hidden" onChange={handle} />
        </label>
        {value && (
          <button type="button" onClick={() => onChange("")} className="ml-3 text-xs text-red-500 inline-flex items-center gap-1">
            <X className="w-3 h-3" /> Quitar
          </button>
        )}
      </div>
    </div>
  );
}

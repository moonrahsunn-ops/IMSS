import React, { useState } from "react";
import { fileToDataUrl } from "@/lib/images";
import { Image } from "@/components/ui/image";
import { Loader2, X, Plus } from "lucide-react";

export default function MultiImageUpload({ label = "Fotos", value = [], onChange }) {
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setLoading(true);
    try {
      const urls = [];
      for (const file of files) urls.push(await fileToDataUrl(file));
      onChange([...(value || []), ...urls]);
    } catch {
      alert("No se pudieron cargar las imágenes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {(value || []).map((url, i) => (
          <div key={i} className="relative w-16 h-16 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden group">
            <Image src={url} alt="" fittingType="fit" className="w-full h-full" />
            <button type="button" onClick={() => onChange(value.filter((_, x) => x !== i))}
              className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-white/80 text-neutral-600 opacity-0 group-hover:opacity-100">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <label className="w-16 h-16 rounded-xl border border-dashed border-neutral-300 flex items-center justify-center cursor-pointer hover:border-neutral-400 text-neutral-400">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handle} />
        </label>
      </div>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { db } from "@/api/db";
import MultiImageUpload from "@/components/product/MultiImageUpload";
import ScrollArea from "@/components/sales/ScrollArea";

export default function WorkForm({ open, onClose, onSaved, work }) {
  const [name, setName] = useState("");
  const [photos, setPhotos] = useState([]);
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(work?.name || "");
      setPhotos([work?.main_image, ...(work?.extra_images || [])].filter(Boolean));
      setDetails(work?.details || "");
    }
  }, [open, work]);

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      main_image: photos[0] || "",
      extra_images: photos.slice(1),
      details,
    };
    if (work?.id) await db.entities.Work.update(work.id, payload);
    else await db.entities.Work.create(payload);
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{work?.id ? "Editar trabajo" : "Nuevo trabajo"}</DialogTitle></DialogHeader>
        <ScrollArea className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
          <div>
            <Label className="text-xs">Nombre del trabajo</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Boda 2024" />
          </div>
          <div>
            <Label className="text-xs">Fotos</Label>
            <MultiImageUpload value={photos} onChange={setPhotos} label="La primera foto será la principal" />
          </div>
          <div>
            <Label className="text-xs">Detalles</Label>
            <Textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} placeholder="Notas sobre el trabajo..." />
          </div>
          <Button className="w-full bg-neutral-900" disabled={saving} onClick={submit}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

import React, { useEffect, useState } from "react";
import { db } from "@/api/db";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, ImageIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WorkForm from "@/components/works/WorkForm";

export default function WorksGallery() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");

  const filtered = works.filter((w) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [w.name, w.details].filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
  });

  const load = async () => {
    const list = await db.entities.Work.list("-updated_date");
    setWorks(list);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  useEffect(() => db.entities.Work.subscribe(() => load()), []);

  const openNew = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (w) => { setEditing(w); setFormOpen(true); };
  const remove = async (w) => {
    if (!window.confirm(`¿Eliminar "${w.name}"?`)) return;
    await db.entities.Work.delete(w.id);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-medium">Galería de Trabajos</h1>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Nuevo trabajo</Button>
      </div>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar trabajo..." className="pl-9" />
      </div>
      {loading ? (
        <p className="text-sm text-neutral-400">Cargando...</p>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-neutral-400">No hay trabajos que coincidan.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((w) => (
            <div key={w.id} className="relative bg-white rounded-2xl border border-neutral-200 hover:shadow-md transition-shadow overflow-hidden">
              <div className="absolute top-2 right-2 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-1.5 rounded-full bg-white/80 hover:bg-neutral-100">
                    <MoreVertical className="w-4 h-4 text-neutral-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(w)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => remove(w)}>Eliminar</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="aspect-square bg-neutral-50 flex items-center justify-center">
                {w.main_image ? (
                  <Image src={w.main_image} alt={w.name} fittingType="fit" className="w-full h-full" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-neutral-300" />
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-neutral-900 truncate">{w.name}</p>
                {w.details ? (
                  <p className="mt-1 text-xs text-neutral-500 line-clamp-3 whitespace-pre-wrap">{w.details}</p>
                ) : (
                  <p className="mt-1 text-xs text-neutral-300">Sin detalles</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <WorkForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); load(); }} work={editing} />
    </div>
  );
}

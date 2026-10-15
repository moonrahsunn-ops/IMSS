import React from "react";
import { Search, SlidersHorizontal, ScanLine, Plus, Package, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const chip = (active) =>
  `px-3 py-1.5 rounded-full text-xs border transition-colors ${
    active ? "bg-neutral-900 text-white border-neutral-900" : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
  }`;

export default function InventoryToolbar({
  query, setQuery, onScan, filters, setFilters, options,
}) {
  const setFilter = (key, value) =>
    setFilters({ ...filters, [key]: filters[key] === value ? "" : value });

  const groups = [
    { key: "capacity_ml", label: "ML", values: options.mls },
    { key: "color", label: "Color", values: options.colors },
    { key: "accessory", label: "Accesorio", values: options.accessories },
    { key: "lid_type", label: "Tipo de tapa", values: options.lids },
    { key: "purpose", label: "Para qué sirve", values: options.purposes },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="pl-9 bg-white rounded-xl border-neutral-200"
          />
        </div>
        <Button variant="outline" className="rounded-xl gap-2" onClick={() => setFilters({})}>
          <SlidersHorizontal className="w-4 h-4" /> Filtros
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {groups.map((g) => (
          <DropdownMenu key={g.key}>
            <DropdownMenuTrigger className={`${chip(!!filters[g.key])} max-w-[160px] truncate`}>
              {filters[g.key] || g.label}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-64 overflow-auto">
              <DropdownMenuLabel>{g.label}</DropdownMenuLabel>
              {(g.values || []).length === 0 && (
                <DropdownMenuItem disabled>Sin datos</DropdownMenuItem>
              )}
              {(g.values || []).map((v) => (
                <DropdownMenuItem key={v} onClick={() => setFilter(g.key, String(v))}>{v}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild className="rounded-xl gap-2 bg-neutral-900">
          <Link to="/producto/nuevo"><Plus className="w-4 h-4" /> Agregar producto</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl gap-2">
          <Link to="/accesorios"><Package className="w-4 h-4" /> Agregar accesorios</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl gap-2">
          <Link to="/ventas"><ShoppingCart className="w-4 h-4" /> Vender</Link>
        </Button>
        <Button variant="outline" className="rounded-xl" onClick={onScan}>
          <ScanLine className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

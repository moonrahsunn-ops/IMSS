import React from "react";
import { Link } from "react-router-dom";
import { MoreVertical, ImageIcon } from "lucide-react";
import { Image } from "@/components/ui/image";
import { gs, productTotalStock, getPrices } from "@/lib/format";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProductCard({ product, onDelete }) {
  const prices = getPrices(product);
  return (
    <div className="relative bg-white rounded-2xl border border-neutral-200 hover:shadow-md transition-shadow overflow-hidden">
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger className="p-1.5 rounded-full bg-white/80 hover:bg-neutral-100">
            <MoreVertical className="w-4 h-4 text-neutral-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild><Link to={`/producto/${product.id}`}>Ver detalle</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to={`/producto/${product.id}/editar`}>Editar</Link></DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => onDelete(product)}>Eliminar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Link to={`/producto/${product.id}`} className="block">
        <div className="aspect-square bg-neutral-50 flex items-center justify-center">
          {product.main_image ? (
            <Image src={product.main_image} alt={product.name} fittingType="fit" className="w-full h-full" />
          ) : (
            <ImageIcon className="w-8 h-8 text-neutral-300" />
          )}
        </div>
        <div className="p-3 text-center">
          <p className="text-sm font-medium text-neutral-900 truncate">{product.name}</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {product.capacity_ml ? `${product.capacity_ml} ml` : "—"}
          </p>
          <div className="mt-3 flex flex-col gap-0.5 text-[11px]">
            {prices.map((p, i) => (
              <div key={i} className="flex items-baseline gap-1 justify-center">
                <span className="font-medium text-neutral-800 tabular-nums">{gs(p.amount)}</span>
                <span className="text-neutral-400 truncate">· {p.name}</span>
              </div>
            ))}
            {prices.length === 0 && <span className="text-neutral-300">Sin precios</span>}
          </div>
          <p className="mt-2 text-[11px] text-neutral-400">Stock: {productTotalStock(product)}</p>
        </div>
      </Link>
    </div>
  );
}

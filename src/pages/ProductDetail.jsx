import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db } from "@/api/db";
import { ChevronLeft, Pencil, Trash2, Check, ImageIcon } from "lucide-react";
import { Image } from "@/components/ui/image";
import { gs, getPrices } from "@/lib/format";
import ColorStockPanel from "@/components/product/ColorStockPanel";
import ClosedBoxPanel from "@/components/product/ClosedBoxPanel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const Row = ({ label, value }) => (
  <div className="flex gap-2 py-1 text-sm">
    <span className="text-neutral-500 shrink-0">{label}</span>
    <span className="text-neutral-900 text-right font-medium truncate">{value || "—"}</span>
  </div>
);

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    db.entities.Product.get(id).then((p) => (p ? setProduct(p) : setNotFound(true)));
    db.entities.Location.list().then(setLocations);
  }, [id]);

  const remove = async () => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    await db.entities.Product.delete(id);
    navigate("/");
  };

  if (notFound) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-neutral-500">No se encontró el producto.</p>
        <Link to="/" className="text-sm underline">Volver al inventario</Link>
      </div>
    );
  }
  if (!product) return <p className="text-sm text-neutral-400">Cargando...</p>;

  const hasColors = (product.colors || []).length > 0;
  const hasPhotos = (product.extra_images || []).length > 0;
  const hasAccessories = (product.accessories || []).length > 0;
  const hasFeatures = (product.features || []).length > 0;
  const prices = getPrices(product);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-neutral-100"><ChevronLeft className="w-5 h-5" /></Link>
        <h1 className="flex-1 text-sm font-medium">Detalle del producto</h1>
        <Link to={`/producto/${id}/editar`} className="p-2 rounded-lg hover:bg-neutral-100"><Pencil className="w-4 h-4" /></Link>
        <button onClick={remove} className="p-2 rounded-lg hover:bg-neutral-100"><Trash2 className="w-4 h-4 text-red-500" /></button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-3 sm:p-4 grid grid-cols-5 gap-3 sm:gap-4">
        <div className="col-span-2 rounded-xl bg-neutral-50 aspect-square flex items-center justify-center overflow-hidden">
          {product.main_image
            ? <Image src={product.main_image} alt={product.name} fittingType="fit" className="w-full h-full" />
            : <ImageIcon className="w-8 h-8 text-neutral-300" />}
        </div>
        <div className="col-span-3">
          <h2 className="text-lg font-medium leading-tight">{product.name}</h2>
          <p className="text-sm text-neutral-500">{product.capacity_ml ? `${product.capacity_ml} ml` : ""}</p>
          {product.product_type && (
            <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-neutral-100 text-xs text-neutral-700">
              {product.product_type}
            </span>
          )}
          <div className="mt-2 grid grid-cols-2 gap-x-3">
            <Row label="Código:" value={product.code} />
            <Row label="Para qué sirve:" value={product.purpose} />
            <Row label="Tapa:" value={product.lid_type} />
            <Row label="Material:" value={product.material} />
          </div>
          {prices.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-neutral-500 mb-1">Precios</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {prices.map((p, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-medium tabular-nums">{gs(p.amount)}</span>
                    <span className="text-neutral-500"> · {p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {product.barcode && (
            <div className="mt-2">
              <p className="text-xs text-neutral-500 mb-0.5">Código de barras</p>
              <div className="inline-block px-2 py-1 rounded bg-neutral-50 border border-neutral-200 font-mono text-xs tracking-wider">
                {product.barcode}
              </div>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="colores" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="colores">Colores</TabsTrigger>
          <TabsTrigger value="cajas">Cajas</TabsTrigger>
          <TabsTrigger value="fotos">Fotos</TabsTrigger>
          <TabsTrigger value="accesorios">Accesorios</TabsTrigger>
          <TabsTrigger value="caracteristicas">Características</TabsTrigger>
        </TabsList>

        <TabsContent value="colores" className="mt-3">
          <div className="bg-white rounded-2xl border border-neutral-200 p-4">
            {hasColors
              ? <ColorStockPanel colors={product.colors} locations={locations.map((l) => l.name)} />
              : <p className="text-sm text-neutral-400">Sin colores registrados.</p>}
          </div>
        </TabsContent>

        <TabsContent value="cajas" className="mt-3">
          <div className="bg-white rounded-2xl border border-neutral-200 p-4">
            <ClosedBoxPanel
              colors={product.colors || []}
              closedBoxes={product.closed_boxes || []}
              locations={locations.map((l) => l.name)}
            />
          </div>
        </TabsContent>

        <TabsContent value="fotos" className="mt-3">
          <div className="bg-white rounded-2xl border border-neutral-200 p-4">
            {hasPhotos ? (
              <div className="grid grid-cols-4 gap-2">
                {product.extra_images.map((u, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-neutral-50 overflow-hidden">
                    <Image src={u} alt="" fittingType="fit" className="w-full h-full" />
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-neutral-400">Sin fotos adicionales.</p>}
          </div>
        </TabsContent>

        <TabsContent value="accesorios" className="mt-3">
          <div className="bg-white rounded-2xl border border-neutral-200 p-4">
            {hasAccessories ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {product.accessories.map((a) => (
                  <div key={a.accessory_id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-neutral-50 overflow-hidden flex items-center justify-center">
                      {a.image_url ? <Image src={a.image_url} alt={a.name} fittingType="fit" className="w-full h-full" />
                        : <ImageIcon className="w-4 h-4 text-neutral-300" />}
                    </div>
                    <div className="text-sm">
                      <p>{a.name}</p>
                      <p className="text-neutral-500 text-xs">{a.qty} unidad(es)</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-neutral-400">Sin accesorios.</p>}
          </div>
        </TabsContent>

        <TabsContent value="caracteristicas" className="mt-3">
          <div className="bg-white rounded-2xl border border-neutral-200 p-4">
            {hasFeatures ? (
              <ul className="space-y-1.5">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 mt-0.5 text-neutral-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-neutral-400">Sin características.</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

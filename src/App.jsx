import { HashRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import Layout from "@/components/Layout";
import PageNotFound from "@/pages/PageNotFound";
import Inventory from "@/pages/Inventory";
import ProductDetail from "@/pages/ProductDetail";
import ProductForm from "@/pages/ProductForm";
import Accessories from "@/pages/Accessories";
import Sales from "@/pages/Sales";
import Reports from "@/pages/Reports";
import WorksGallery from "@/pages/WorksGallery";
import Configuration from "@/pages/Configuration";

// HashRouter: las rutas funcionan en cualquier hosting estático (GitHub Pages) sin configuración extra.
export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Inventory />} />
          <Route path="/producto/nuevo" element={<ProductForm />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/producto/:id/editar" element={<ProductForm />} />
          <Route path="/accesorios" element={<Accessories />} />
          <Route path="/ventas" element={<Sales />} />
          <Route path="/reportes" element={<Reports />} />
          <Route path="/galeria" element={<WorksGallery />} />
          <Route path="/configuracion" element={<Configuration />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </HashRouter>
  );
}

import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, Bell, Package, ShoppingCart, BarChart3, Settings, Boxes, Images } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const nav = [
  { to: "/", label: "Inventario", icon: Package },
  { to: "/accesorios", label: "Accesorios", icon: Boxes },
  { to: "/ventas", label: "Ventas", icon: ShoppingCart },
  { to: "/reportes", label: "Reportes", icon: BarChart3 },
  { to: "/galeria", label: "Galería", icon: Images },
  { to: "/configuracion", label: "Configuración", icon: Settings },
];

function NavList({ onNavigate }) {
  const { pathname } = useLocation();
  return (
    <nav className="p-3 space-y-1">
      {nav.map((n) => (
        <Link
          key={n.to}
          to={n.to}
          onClick={onNavigate}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
            pathname === n.to ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          <n.icon className="w-4 h-4" />
          {n.label}
        </Link>
      ))}
    </nav>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto flex items-center gap-3 px-4 h-14">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 lg:hidden">
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Menú</SheetTitle>
              <div className="px-6 pt-6 pb-2 text-sm tracking-[0.25em] font-medium">INVENTARIO</div>
              <NavList onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="flex-1 text-center lg:text-left text-sm tracking-[0.25em] font-medium">INVENTARIO</span>
          <Bell className="w-5 h-5 text-neutral-400 hidden sm:block" />
        </div>
      </header>
      <div className="max-w-6xl mx-auto flex">
        <aside className="hidden lg:block w-60 shrink-0 border-r border-neutral-200 bg-white min-h-[calc(100vh-3.5rem)]">
          <NavList />
        </aside>
        <main className="flex-1 min-w-0 p-4 sm:p-6 bg-neutral-50 min-h-[calc(100vh-3.5rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

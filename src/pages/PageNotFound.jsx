import { Link, useLocation } from "react-router-dom";

export default function PageNotFound() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-50">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-7xl font-light text-neutral-300">404</h1>
        <p className="text-neutral-600">
          La página <span className="font-medium text-neutral-800">{pathname}</span> no existe.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50"
        >
          Volver al inventario
        </Link>
      </div>
    </div>
  );
}

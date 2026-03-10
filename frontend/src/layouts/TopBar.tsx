import { useLocation } from "react-router-dom";

const TITLES: Record<string, string> = {
  "/dashboard": "Resumen",
  "/clientes": "Clientes",
  "/pedidos": "Pedidos",
  "/inventario": "Inventario",
  "/inventario/stock": "Stock",
  "/inventario/movimientos": "Movimientos de Inventario",
  "/inventario/nuevo-movimiento": "Nuevo movimiento",
};

function getTitle(pathname: string): string {
  return TITLES[pathname] ?? "Excalibur ERP";
}

export function TopBar() {
  const location = useLocation();
  const title = getTitle(location.pathname);

  return (
    <header className="border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur md:px-6">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
    </header>
  );
}

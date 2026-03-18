import { useLocation } from "react-router-dom";

const TITLES: Record<string, string> = {
  "/dashboard": "Resumen",
  "/clientes": "Clientes",
  "/clientes/nuevo": "Nuevo cliente",
  "/gastos": "Gastos",
  "/gastos/nuevo": "Nuevo gasto",
  "/pedidos": "Pedidos",
  "/pedidos/nuevo": "Nuevo pedido",
  "/inventario": "Inventario",
  "/inventario/stock": "Stock",
  "/inventario/movimientos": "Movimientos de Inventario",
  "/inventario/nuevo-movimiento": "Nuevo movimiento",
};

function getTitle(pathname: string): string {
  if (pathname.startsWith("/clientes/") && pathname.endsWith("/editar")) {
    return "Editar cliente";
  }
  if (pathname.startsWith("/gastos/") && pathname.endsWith("/editar")) {
    return "Editar gasto";
  }
  if (pathname.startsWith("/pedidos/") && pathname !== "/pedidos/nuevo") {
    return "Detalle de pedido";
  }
  return TITLES[pathname] ?? "Excalibur ERP";
}

export function TopBar() {
  const location = useLocation();
  const title = getTitle(location.pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200 bg-white/95 px-4 backdrop-blur md:px-8">
      <h1 className="text-xl font-semibold text-stone-900">{title}</h1>
      <span className="hidden rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600 md:inline-flex">
        ERP interno
      </span>
    </header>
  );
}

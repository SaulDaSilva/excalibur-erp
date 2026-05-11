import { useMemo } from "react";
import { useLocation } from "react-router-dom";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clientes": "Clientes",
  "/clientes/nuevo": "Nuevo cliente",
  "/gastos": "Gastos",
  "/gastos/nuevo": "Nuevo gasto",
  "/pedidos": "Pedidos",
  "/pedidos/nuevo": "Nuevo pedido",
  "/inventario": "Inventario",
  "/inventario/stock": "Stock",
  "/inventario/movimientos": "Movimientos",
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

function formatTodayLabel(): string {
  return new Intl.DateTimeFormat("es-EC", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());
}

export function TopBar() {
  const location = useLocation();
  const title = getTitle(location.pathname);
  const todayLabel = useMemo(() => formatTodayLabel(), []);

  return (
    <header className="px-4 pt-4 md:px-8">
      <div className="flex min-h-[5rem] items-center justify-between gap-4 rounded-[30px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.9)] px-5 py-3 shadow-[0_12px_24px_rgba(15,23,42,0.05)] backdrop-blur">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[1.45rem] font-semibold tracking-[-0.04em] text-[var(--text-main)]">
            {title}
          </h1>
        </div>

        <div className="flex items-center">
          <span className="inline-flex rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-soft)]">
            {todayLabel}
          </span>
        </div>
      </div>
    </header>
  );
}

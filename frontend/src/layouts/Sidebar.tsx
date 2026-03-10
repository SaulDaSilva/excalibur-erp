import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { Button } from "../components/ui/Button";

type SidebarProps = {
  onLogout: () => void;
  isLoggingOut: boolean;
};

const NAV_ITEMS = [
  { to: "/dashboard", label: "Resumen" },
  { to: "/clientes", label: "Clientes" },
  { to: "/pedidos", label: "Pedidos" },
];

const INVENTARIO_ITEMS = [
  { to: "/inventario/stock", label: "Stock" },
  { to: "/inventario/movimientos", label: "Movimientos de Inventario" },
];

function navItemClassName(isActive: boolean): string {
  const base =
    "rounded-lg px-3 py-2 text-sm font-medium transition text-slate-200/80 hover:bg-slate-800/50 hover:text-white";
  const active = "bg-slate-800/80 text-white";
  return isActive ? `${base} ${active}` : base;
}

function childNavItemClassName(isActive: boolean): string {
  const base =
    "rounded-lg px-3 py-2 text-sm transition text-slate-300/80 hover:bg-slate-800/40 hover:text-white";
  const active = "bg-slate-800/70 text-white";
  return isActive ? `${base} ${active}` : base;
}

export function Sidebar({ onLogout, isLoggingOut }: SidebarProps) {
  const location = useLocation();
  const isInventarioRoute = location.pathname.startsWith("/inventario");
  const [isInventarioOpen, setIsInventarioOpen] = useState(isInventarioRoute);

  useEffect(() => {
    if (isInventarioRoute) {
      setIsInventarioOpen(true);
    }
  }, [isInventarioRoute]);

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-950 p-4 md:sticky md:top-0 md:flex md:h-screen md:flex-col">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 shadow-shell">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Excalibur ERP</p>
          <p className="mt-1 text-sm font-medium text-slate-100">Panel ERP</p>
        </div>

        <nav className="mt-4 flex flex-1 flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => navItemClassName(isActive)}>
              {item.label}
            </NavLink>
          ))}

          <div className="space-y-2">
            <button
              type="button"
              className={navItemClassName(isInventarioRoute)}
              onClick={() => setIsInventarioOpen((current) => !current)}
            >
              <span className="flex items-center justify-between gap-3">
                <span>Inventario</span>
                <span className={`text-xs transition ${isInventarioOpen ? "rotate-180" : ""}`}>▼</span>
              </span>
            </button>

            {isInventarioOpen && (
              <div className="ml-3 flex flex-col gap-1 border-l border-slate-800 pl-3">
                {INVENTARIO_ITEMS.map((item) => (
                  <NavLink key={item.to} to={item.to} className={({ isActive }) => childNavItemClassName(isActive)}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        <Button variant="danger" onClick={onLogout} disabled={isLoggingOut}>
          {isLoggingOut ? "Cerrando sesion..." : "Cerrar sesion"}
        </Button>
      </aside>

      <div className="border-b border-slate-800 bg-slate-950 p-3 md:hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold tracking-wide text-slate-100">Excalibur ERP</p>
          <Button variant="danger" className="px-2 py-1 text-xs" onClick={onLogout} disabled={isLoggingOut}>
            {isLoggingOut ? "..." : "Salir"}
          </Button>
        </div>
        <nav className="mt-3 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `${navItemClassName(isActive)} whitespace-nowrap`}
            >
              {item.label}
            </NavLink>
          ))}

          <div className="space-y-2">
            <button
              type="button"
              className={`${navItemClassName(isInventarioRoute)} w-full whitespace-nowrap text-left`}
              onClick={() => setIsInventarioOpen((current) => !current)}
            >
              <span className="flex items-center justify-between gap-3">
                <span>Inventario</span>
                <span className={`text-xs transition ${isInventarioOpen ? "rotate-180" : ""}`}>▼</span>
              </span>
            </button>

            {isInventarioOpen && (
              <div className="ml-3 flex flex-col gap-1 border-l border-slate-800 pl-3">
                {INVENTARIO_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `${childNavItemClassName(isActive)} whitespace-nowrap`}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}

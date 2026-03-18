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
  { to: "/gastos", label: "Gastos" },
];

const INVENTARIO_ITEMS = [
  { to: "/inventario/stock", label: "Stock" },
  { to: "/inventario/movimientos", label: "Movimientos de Inventario" },
];

function navItemClassName(isActive: boolean): string {
  const base =
    "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors text-stone-300 hover:bg-stone-800 hover:text-stone-100";
  const active = "bg-teal-600/10 font-medium text-teal-400";
  return isActive ? `${base} ${active}` : base;
}

function childNavItemClassName(isActive: boolean): string {
  const base =
    "rounded-lg px-3 py-2 text-sm transition-colors text-stone-400 hover:bg-stone-800 hover:text-stone-100";
  const active = "bg-stone-800 text-stone-100";
  return isActive ? `${base} ${active}` : base;
}

function NavIndicator({ active }: { active: boolean }) {
  return <span className={`h-2 w-2 rounded-full ${active ? "bg-teal-400" : "bg-stone-600"}`} aria-hidden="true" />;
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
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-stone-900 text-stone-300 md:flex">
        <div className="flex h-16 items-center border-b border-stone-800 px-6">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600 text-sm font-semibold">
              EX
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Excalibur ERP</p>
              <p className="mt-0.5 text-sm font-medium text-stone-100">Panel operativo</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-6">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => navItemClassName(isActive)}>
              {({ isActive }) => (
                <>
                  <NavIndicator active={isActive} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          <div className="space-y-2">
            <button
              type="button"
              className={navItemClassName(isInventarioRoute)}
              onClick={() => setIsInventarioOpen((current) => !current)}
            >
              <span className="flex flex-1 items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <NavIndicator active={isInventarioRoute} />
                  <span>Inventario</span>
                </span>
                <span className={`text-xs transition ${isInventarioOpen ? "rotate-180" : ""}`}>v</span>
              </span>
            </button>

            {isInventarioOpen && (
              <div className="ml-4 flex flex-col gap-1 border-l border-stone-800 pl-3">
                {INVENTARIO_ITEMS.map((item) => (
                  <NavLink key={item.to} to={item.to} className={({ isActive }) => childNavItemClassName(isActive)}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="border-t border-stone-800 p-4">
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-stone-800/70 px-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-700 text-sm font-semibold text-white">
              ERP
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">Usuario autenticado</p>
              <p className="truncate text-xs text-stone-400">Sesion interna</p>
            </div>
          </div>
          <Button variant="danger" className="w-full" onClick={onLogout} disabled={isLoggingOut}>
            {isLoggingOut ? "Cerrando sesion..." : "Cerrar sesion"}
          </Button>
        </div>
      </aside>

      <div className="border-b border-stone-800 bg-stone-900 p-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-xs font-semibold text-white">
              EX
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Excalibur ERP</p>
              <p className="text-sm font-medium text-stone-100">Panel operativo</p>
            </div>
          </div>
          <Button variant="danger" className="px-2 py-1 text-xs" onClick={onLogout} disabled={isLoggingOut}>
            {isLoggingOut ? "..." : "Salir"}
          </Button>
        </div>

        <nav className="mt-3 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `${navItemClassName(isActive)} whitespace-nowrap`}>
              {({ isActive }) => (
                <>
                  <NavIndicator active={isActive} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          <div className="space-y-2">
            <button
              type="button"
              className={`${navItemClassName(isInventarioRoute)} w-full whitespace-nowrap text-left`}
              onClick={() => setIsInventarioOpen((current) => !current)}
            >
              <span className="flex flex-1 items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <NavIndicator active={isInventarioRoute} />
                  <span>Inventario</span>
                </span>
                <span className={`text-xs transition ${isInventarioOpen ? "rotate-180" : ""}`}>v</span>
              </span>
            </button>

            {isInventarioOpen && (
              <div className="ml-4 flex flex-col gap-1 border-l border-stone-800 pl-3">
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

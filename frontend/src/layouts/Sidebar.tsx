import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { Button } from "../components/ui/Button";

type SidebarProps = {
  onLogout: () => void;
  isLoggingOut: boolean;
};

type NavItem = {
  to: string;
  label: string;
  icon: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const SECTIONS: NavSection[] = [
  {
    title: "Menu Principal",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: "DS" },
      { to: "/clientes", label: "Clientes", icon: "CL" },
      { to: "/pedidos", label: "Pedidos", icon: "PD" },
    ],
  },
];

const OPERACIONES_ITEMS: NavItem[] = [{ to: "/gastos", label: "Gastos", icon: "GT" }];

const INVENTARIO_ITEMS: NavItem[] = [
  { to: "/inventario/stock", label: "Stock", icon: "ST" },
  { to: "/inventario/movimientos", label: "Movimientos", icon: "MV" },
];

const ICON_PATHS: Record<string, string> = {
  DS: "dashboard.png",
  CL: "costumer.png",
  PD: "checkout.png",
  GT: "spending.png",
  IV: "in-stock.png",
  ST: "in-stock.png",
  MV: "conveyor.png",
};

function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`;
}

function iconBlock(label: string, active: boolean) {
  const iconPath = ICON_PATHS[label];
  const iconSrc = iconPath ? assetUrl(iconPath) : null;

  return (
    <span
      className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl border text-[0.68rem] font-bold tracking-[0.16em] ${
        active
          ? "border-[rgba(49,94,251,0.16)] bg-[var(--accent-soft)] text-[var(--accent)]"
          : "border-[var(--border-soft)] bg-[var(--surface-muted)] text-[var(--text-soft)]"
      }`}
      aria-hidden="true"
    >
      {iconSrc ? (
        <img
          src={iconSrc}
          alt=""
          className={`h-[1.1rem] w-[1.1rem] object-contain ${active ? "opacity-100" : "opacity-65 grayscale-[0.15]"}`}
        />
      ) : (
        label
      )}
    </span>
  );
}

function navItemClassName(isActive: boolean): string {
  const base =
    "group flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-sm font-medium transition duration-150 ease-out";
  const active =
    "bg-[linear-gradient(180deg,rgba(49,94,251,0.08)_0%,rgba(49,94,251,0.13)_100%)] text-[var(--text-main)] shadow-[0_8px_16px_rgba(49,94,251,0.08)]";
  const idle = "text-[var(--text-muted)] hover:bg-white hover:text-[var(--text-main)]";
  return `${base} ${isActive ? active : idle}`;
}

function childNavItemClassName(isActive: boolean): string {
  const base = "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition";
  return isActive
    ? `${base} bg-white text-[var(--text-main)] shadow-[0_4px_12px_rgba(15,23,42,0.05)]`
    : `${base} text-[var(--text-muted)] hover:bg-white/80 hover:text-[var(--text-main)]`;
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
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[18.75rem] flex-col border-r border-[var(--border-soft)] bg-[rgba(251,249,245,0.92)] px-4 py-5 backdrop-blur md:flex">
        <div className="mb-6 flex items-center gap-3 rounded-[26px] border border-[var(--border-soft)] bg-white/90 px-4 py-3 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[18px]">
            <img src={assetUrl("logo_web.png")} alt="Excalibur" className="h-12 w-12 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold tracking-[-0.03em] text-[var(--text-main)]">Excalibur ERP</p>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-soft)]">Workspace</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto pr-1">
          {SECTIONS.map((section) => (
            <div key={section.title} className="space-y-2">
              <p className="px-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--text-soft)]">
                {section.title}
              </p>
              <div className="space-y-1.5 rounded-[26px] border border-[var(--border-soft)] bg-[var(--surface-muted)] p-2">
                {section.items.map((item) => (
                  <NavLink key={item.to} to={item.to} className={({ isActive }) => navItemClassName(isActive)}>
                    {({ isActive }) => (
                      <>
                        {iconBlock(item.icon, isActive)}
                        <span className="flex-1">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          <div className="space-y-2">
            <p className="px-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--text-soft)]">
              Operaciones
            </p>
            <div className="rounded-[26px] border border-[var(--border-soft)] bg-[var(--surface-muted)] p-2">
              {OPERACIONES_ITEMS.map((item) => (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => navItemClassName(isActive)}>
                  {({ isActive }) => (
                    <>
                      {iconBlock(item.icon, isActive)}
                      <span className="flex-1">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}

              <button
                type="button"
                className={navItemClassName(isInventarioRoute)}
                onClick={() => setIsInventarioOpen((current) => !current)}
              >
                {iconBlock("IV", isInventarioRoute)}
                <span className="flex-1 text-left">Inventario</span>
                <span className={`text-xs text-[var(--text-soft)] transition ${isInventarioOpen ? "rotate-180" : ""}`}>v</span>
              </button>

              {isInventarioOpen && (
                <div className="mt-2 space-y-1.5 border-t border-[var(--border-soft)] px-2 pt-2">
                  {INVENTARIO_ITEMS.map((item) => (
                    <NavLink key={item.to} to={item.to} className={({ isActive }) => childNavItemClassName(isActive)}>
                      {({ isActive }) => (
                        <>
                          {iconBlock(item.icon, isActive)}
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </div>
        </nav>

        <div className="mt-6 rounded-[24px] border border-[var(--border-soft)] bg-white/90 p-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,#315efb_0%,#4a73ff_100%)] text-sm font-bold text-white">
              ER
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--text-main)]">Usuario autenticado</p>
              <p className="truncate text-xs text-[var(--text-soft)]">Acceso operativo</p>
            </div>
          </div>
          <Button variant="danger" className="w-full" onClick={onLogout} disabled={isLoggingOut}>
            {isLoggingOut ? "Cerrando sesion..." : "Cerrar sesion"}
          </Button>
        </div>
      </aside>

      <div className="border-b border-[var(--border-soft)] bg-[rgba(251,249,245,0.95)] px-4 py-3 backdrop-blur md:hidden">
        <div className="rounded-[24px] border border-[var(--border-soft)] bg-white/90 p-3 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[16px]">
                <img src={assetUrl("logo_web.png")} alt="Excalibur" className="h-10 w-10 object-contain" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-main)]">Excalibur ERP</p>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Workspace</p>
              </div>
            </div>
            <Button variant="danger" className="px-3 py-2 text-xs" onClick={onLogout} disabled={isLoggingOut}>
              {isLoggingOut ? "..." : "Salir"}
            </Button>
          </div>

          <nav className="mt-4 space-y-1.5">
            {SECTIONS[0].items.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => navItemClassName(isActive)}>
                {({ isActive }) => (
                  <>
                    {iconBlock(item.icon, isActive)}
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}

            {OPERACIONES_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => navItemClassName(isActive)}>
                {({ isActive }) => (
                  <>
                    {iconBlock(item.icon, isActive)}
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}

            <button
              type="button"
              className={`${navItemClassName(isInventarioRoute)} w-full`}
              onClick={() => setIsInventarioOpen((current) => !current)}
            >
              {iconBlock("IV", isInventarioRoute)}
              <span className="flex-1 text-left">Inventario</span>
              <span className={`text-xs text-[var(--text-soft)] transition ${isInventarioOpen ? "rotate-180" : ""}`}>v</span>
            </button>

            {isInventarioOpen && (
              <div className="ml-4 space-y-1.5 border-l border-[var(--border-soft)] pl-4">
                {INVENTARIO_ITEMS.map((item) => (
                  <NavLink key={item.to} to={item.to} className={({ isActive }) => childNavItemClassName(isActive)}>
                    {({ isActive }) => (
                      <>
                        {iconBlock(item.icon, isActive)}
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}

import { Navigate, Route, Routes } from "react-router-dom";

import { LoginPage } from "./features/auth/LoginPage";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { ClientesPage } from "./pages/ClientesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InventarioMovimientosPage } from "./pages/InventarioMovimientosPage";
import { InventarioMovimientoNuevoPage } from "./pages/InventarioMovimientoNuevoPage";
import { InventarioStockPage } from "./pages/InventarioStockPage";
import { PedidosPage } from "./pages/PedidosPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="pedidos" element={<PedidosPage />} />
          <Route path="inventario" element={<Navigate to="/inventario/stock" replace />} />
          <Route path="inventario/stock" element={<InventarioStockPage />} />
          <Route path="inventario/movimientos" element={<InventarioMovimientosPage />} />
          <Route path="inventario/nuevo-movimiento" element={<InventarioMovimientoNuevoPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

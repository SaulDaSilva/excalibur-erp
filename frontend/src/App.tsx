import { Navigate, Route, Routes } from "react-router-dom";

import { LoginPage } from "./features/auth/LoginPage";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { ClienteFormPage } from "./pages/ClienteFormPage";
import { ClientesPage } from "./pages/ClientesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { GastoFormPage } from "./pages/GastoFormPage";
import { GastosPage } from "./pages/GastosPage";
import { InventarioMovimientosPage } from "./pages/InventarioMovimientosPage";
import { InventarioMovimientoNuevoPage } from "./pages/InventarioMovimientoNuevoPage";
import { InventarioStockPage } from "./pages/InventarioStockPage";
import { PedidoDetallePage } from "./pages/PedidoDetallePage";
import { PedidoNuevoPage } from "./pages/PedidoNuevoPage";
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
          <Route path="clientes/nuevo" element={<ClienteFormPage mode="create" />} />
          <Route path="clientes/:clienteId/editar" element={<ClienteFormPage mode="edit" />} />
          <Route path="pedidos" element={<PedidosPage />} />
          <Route path="pedidos/nuevo" element={<PedidoNuevoPage />} />
          <Route path="pedidos/:pedidoId" element={<PedidoDetallePage />} />
          <Route path="inventario" element={<Navigate to="/inventario/stock" replace />} />
          <Route path="inventario/stock" element={<InventarioStockPage />} />
          <Route path="inventario/movimientos" element={<InventarioMovimientosPage />} />
          <Route path="inventario/nuevo-movimiento" element={<InventarioMovimientoNuevoPage />} />
          <Route path="gastos" element={<GastosPage />} />
          <Route path="gastos/nuevo" element={<GastoFormPage mode="create" />} />
          <Route path="gastos/:gastoId/editar" element={<GastoFormPage mode="edit" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

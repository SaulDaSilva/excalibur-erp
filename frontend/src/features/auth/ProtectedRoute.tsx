import { Navigate, Outlet } from "react-router-dom";

import { useMe } from "./useMe";

export function ProtectedRoute() {
  const { data: user, isLoading, isFetching } = useMe();

  if (isLoading || (isFetching && !user)) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

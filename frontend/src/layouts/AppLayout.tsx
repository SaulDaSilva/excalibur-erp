import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { Container } from "../components/ui/Container";
import { Notice } from "../components/ui/Notice";
import { logout } from "../features/auth/api";
import { toApiError } from "../lib/api";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setErrorMessage("");
    setIsLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      const apiError = toApiError(error);
      setErrorMessage(apiError.detail);
    } finally {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/login", { replace: true });
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <Sidebar onLogout={handleLogout} isLoggingOut={isLoggingOut} />

      <div className="flex min-h-screen flex-1 flex-col bg-slate-50 text-slate-900">
        <TopBar />
        {errorMessage && (
          <div className="px-4 pt-4 md:px-6">
            <Notice variant="error" message={errorMessage} />
          </div>
        )}

        <main className="flex-1 p-4 md:p-6">
          <Container>
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
  );
}

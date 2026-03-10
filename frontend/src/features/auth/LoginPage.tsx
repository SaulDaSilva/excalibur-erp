import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { toApiError } from "../../lib/api";
import { getCsrf, login } from "./api";

type LoginFormValues = {
  username: string;
  password: string;
};

const loginSchema = z.object({
  username: z.string().min(1, "El usuario es obligatorio."),
  password: z.string().min(1, "La contrasena es obligatoria."),
});

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState("");
  const [isCsrfReady, setIsCsrfReady] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    void getCsrf()
      .then(() => setIsCsrfReady(true))
      .catch(() => setIsCsrfReady(false));
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setErrorMessage("");

    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "username" || field === "password") {
          setError(field, { message: issue.message });
        }
      }
      return;
    }

    try {
      if (!isCsrfReady) {
        await getCsrf();
        setIsCsrfReady(true);
      }
      const user = await login(values.username, values.password);
      queryClient.setQueryData(["me"], user);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const apiError = toApiError(error);
      setErrorMessage(apiError.detail);
    }
  });

  return (
    <main className="mx-auto mt-16 w-full max-w-sm px-4">
      <Card>
        <h1 className="text-xl font-semibold text-slate-900">Iniciar sesion</h1>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <label htmlFor="username">Usuario</label>
          <input id="username" type="text" {...register("username")} />
          {errors.username && <p className="text-xs text-rose-600">{errors.username.message}</p>}

          <label htmlFor="password">Contrasena</label>
          <input id="password" type="password" {...register("password")} />
          {errors.password && <p className="text-xs text-rose-600">{errors.password.message}</p>}

          {errorMessage && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>}

          <Button type="submit" variant="primary" disabled={isSubmitting || !isCsrfReady}>
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </Card>
    </main>
  );
}

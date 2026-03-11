import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import formStyles from "../../components/ui/FormLayout.module.css";
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
    <main className="mx-auto mt-16 w-full max-w-md px-4">
      <Card className="space-y-6">
        <div className={formStyles.intro}>
          <p className={formStyles.introTitle}>Iniciar sesion</p>
          <p className={formStyles.introText}>Accede con tus credenciales internas para entrar al ERP.</p>
        </div>

        <form onSubmit={onSubmit} className={formStyles.form}>
          <div className={formStyles.field}>
            <label htmlFor="username">Usuario</label>
            <input id="username" type="text" {...register("username")} />
            {errors.username && <p className={formStyles.errorText}>{errors.username.message}</p>}
          </div>

          <div className={formStyles.field}>
            <label htmlFor="password">Contrasena</label>
            <input id="password" type="password" {...register("password")} />
            {errors.password && <p className={formStyles.errorText}>{errors.password.message}</p>}
          </div>

          {errorMessage && <p className={formStyles.errorBox}>{errorMessage}</p>}

          <div className={formStyles.actions}>
            <Button type="submit" variant="primary" disabled={isSubmitting || !isCsrfReady}>
              {isSubmitting ? "Ingresando..." : "Ingresar"}
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}

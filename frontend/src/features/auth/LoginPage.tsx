import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import formStyles from "../../components/ui/FormLayout.module.css";
import brandLogo from "../../assets/img/logotipo_marca.png";
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
    <main className="min-h-screen px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-[1380px] items-center gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className={formStyles.brand}>
          <div className={`${formStyles.brandPanel} w-full`}>
            <img src={brandLogo} alt="Excalibur ERP V2" className={formStyles.brandLogo} />
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Card className="mx-auto w-full max-w-xl space-y-7 rounded-[32px] px-6 py-7 md:px-8 md:py-8">
            <div className="space-y-3">
              <div className="inline-flex rounded-full border border-[var(--border-soft)] bg-[var(--surface-muted)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                Secure login
              </div>
              <div>
                <h1 className="text-[2rem] font-semibold tracking-[-0.05em] text-[var(--text-main)]">Iniciar sesion</h1>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  Accede con tus credenciales internas para entrar al ERP y operar sobre los modulos del sistema.
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className={formStyles.form}>
              <div className={formStyles.field}>
                <label htmlFor="username">Usuario</label>
                <input id="username" type="text" autoComplete="username" {...register("username")} />
                {errors.username && <p className={formStyles.errorText}>{errors.username.message}</p>}
              </div>

              <div className={formStyles.field}>
                <label htmlFor="password">Contrasena</label>
                <input id="password" type="password" autoComplete="current-password" {...register("password")} />
                {errors.password && <p className={formStyles.errorText}>{errors.password.message}</p>}
              </div>

              {errorMessage && <p className={formStyles.errorBox}>{errorMessage}</p>}

              <div className="flex flex-col gap-3 border-t border-[var(--border-soft)] pt-5">
                <Button type="submit" variant="primary" disabled={isSubmitting || !isCsrfReady} className="w-full">
                  {isSubmitting ? "Ingresando..." : "Ingresar al panel"}
                </Button>
                <p className="text-center text-xs text-[var(--text-soft)]">
                  Uso restringido a usuarios autorizados de la organizacion.
                </p>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </main>
  );
}

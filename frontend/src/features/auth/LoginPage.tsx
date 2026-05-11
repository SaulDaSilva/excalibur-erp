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
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-[1280px] gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(49,94,251,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(17,24,39,0.08),transparent_24%)]" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[linear-gradient(180deg,#131313_0%,#2c2c2c_100%)] text-base font-bold text-white">
              EX
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-[-0.04em] text-[var(--text-main)]">Excalibur ERP</p>
              <p className="text-sm text-[var(--text-muted)]">Workspace interno para operacion diaria</p>
            </div>
          </div>

          <div className="relative z-10 space-y-6">
            <div className={formStyles.brand}>
              <div className={formStyles.brandPanel}>
                <img src={brandLogo} alt="Excalibur ERP V2" className={formStyles.brandLogo} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["Clientes", "Gestiona catalogo y direcciones"],
                ["Pedidos", "Opera ventas y despacho"],
                ["Inventario", "Monitorea stock y movimientos"],
              ].map(([title, copy]) => (
                <div
                  key={title}
                  className="rounded-[24px] border border-[var(--border-soft)] bg-white/85 px-4 py-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)]"
                >
                  <p className="text-sm font-semibold text-[var(--text-main)]">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-sm leading-6 text-[var(--text-muted)]">
            Acceso privado para operacion comercial, inventario y control financiero del negocio.
          </p>
        </Card>

        <div className="flex items-center">
          <Card className="mx-auto w-full max-w-xl space-y-7">
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

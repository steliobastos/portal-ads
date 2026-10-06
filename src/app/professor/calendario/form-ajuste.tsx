"use client";

import { useActionState, type ReactNode } from "react";
import type { EstadoAjuste } from "./acoes";

/**
 * Um ajuste = um formulário. Mostra o erro da linha e trava os campos enquanto
 * grava. Depois de gravar, a página volta do servidor com os valores novos.
 */
export function FormAjuste({
  acao,
  children,
  className,
}: {
  acao: (estado: EstadoAjuste, form: FormData) => Promise<EstadoAjuste>;
  children: ReactNode;
  className?: string;
}) {
  const [estado, enviar, pendente] = useActionState(acao, null);
  return (
    <form action={enviar} className={className ?? "flex flex-wrap items-center gap-2"}>
      <fieldset disabled={pendente} className="contents">
        {children}
      </fieldset>
      {estado && "erro" in estado && (
        <p role="alert" className="w-full text-xs text-alert">
          {estado.erro}
        </p>
      )}
    </form>
  );
}

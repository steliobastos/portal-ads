"use client";

import { useActionState } from "react";
import { entrar } from "@/app/professor/acoes";

export function LoginProfessor() {
  const [estado, acao, pendente] = useActionState(entrar, null);

  return (
    <form action={acao} className="max-w-sm space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="mt-1.5 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:border-primary"
        />
      </div>
      <div>
        <label htmlFor="senha" className="block text-sm font-medium text-ink">
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1.5 w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:border-primary"
        />
      </div>
      <button
        type="submit"
        disabled={pendente}
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-60"
      >
        {pendente ? "Entrando…" : "Entrar"}
      </button>
      <p role="alert" className="text-sm text-alert">
        {estado?.erro}
      </p>
    </form>
  );
}

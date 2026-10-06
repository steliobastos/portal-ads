import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Testes das regras puras do portal (correção do quiz, prazos, portfólio).
 * O apelido `@/` é o mesmo do `tsconfig.json`.
 */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});

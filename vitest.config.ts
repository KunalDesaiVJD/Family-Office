import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Vitest runs the pure calculation engine in a Node environment. The "@" alias
// mirrors tsconfig so tests can import engine/mock modules the same way the app
// does. Test files live under /tests and are excluded from the Next build.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});

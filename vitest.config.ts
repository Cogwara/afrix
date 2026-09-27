import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@prisma/client/runtime/library": path.resolve(__dirname, "./lib/prisma-client.ts"),
      "@prisma/client": path.resolve(__dirname, "./lib/prisma-client.ts"),
    },
  },
});

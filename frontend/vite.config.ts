
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(async () => {
  const baseConfig: any = {
    plugins: [react(), tailwindcss()],
  };

  try {
    const tanstackModule = (await import("@lovable.dev/vite-tanstack-config")) as any;
    const tanstackConfig = tanstackModule?.default ?? tanstackModule;

    if (typeof tanstackConfig === "function") {
      return tanstackConfig(baseConfig);
    }

    return {
      ...baseConfig,
      ...tanstackConfig,
    };
  } catch {
    return baseConfig;
  }
});


import { defineConfig } from "vite";

export default defineConfig(async () => {
  try {
    // Try to load the optional tanstack Vite helper. If it's not installed,
    // fall back to a empty config so the build won't fail on platforms
    // where the package isn't present (e.g. Vercel) unless you explicitly
    // add it to dependencies.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    await import("@lovable.dev/vite-tanstack-config");
    return {
      tanstackStart: {
        server: { entry: "server" },
      },
    } as any;
  } catch (err) {
    return {} as any;
  }
});

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
  site: "https://history.icbe.rman.dev",
});

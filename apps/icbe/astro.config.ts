import cloudflare from "@astrojs/cloudflare";
import solid from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";

type EnvSchema = NonNullable<
  Parameters<typeof defineConfig>[0]["env"]
>["schema"];

const envSchema: EnvSchema = {
  GITLAB_ACCESS_TOKEN: envField.string({
    context: "server",
    access: "secret",
    startsWith: "glpat",
    length: 26,
  }),
  GITLAB_PROJECT_ID: envField.number({
    context: "server",
    access: "secret",
    int: true,
    gt: 1,
  }),
};

export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  integrations: [solid()],
  vite: { plugins: [tailwindcss()] },
  site: "https://icbe.rman.dev",

  env: {
    schema: envSchema,
    validateSecrets: true,
  },
});

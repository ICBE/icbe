import { defineConfig } from "usts/config";

export default defineConfig({
  entryPoint: "./src/index.ts",
  outDir: "./dist",
  header: {
    name: "Color proven Elements",
    namespace: "rman.dev",
    version: "3.0.0",
    description:
      "Colors elements that are proven to Base Elements in green color",
    author: "gameroman",
    license: "MIT",
    homepageURL: "https://rman.dev/discord",
    supportURL: "https://rman.dev/discord",
    match: "https://neal.fun/infinite-craft/",
  },
});

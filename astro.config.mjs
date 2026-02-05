import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  output: "static",
  site: "https://nekopath-dev.github.io",
  base: "/tanaka-yuuna-hp",
  integrations: [tailwind()],
});

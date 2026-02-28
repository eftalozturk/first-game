import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Github Pages üzerinde /first-game/ altına yerleştirildiği için
  // üretim taban URL'si burada belirtilmeli. Bu değer aynı zamanda
  // import.meta.env.BASE_URL olarak uygulamaya aktarılır.
  base: "/first-game/",
});

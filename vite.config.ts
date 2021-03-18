import reactRefresh from "@vitejs/plugin-react-refresh";
import { defineConfig } from "vite";

export default defineConfig({
  // https://github.com/vitejs/vite/tree/main/packages/plugin-react-refresh
  plugins: [reactRefresh()],
});

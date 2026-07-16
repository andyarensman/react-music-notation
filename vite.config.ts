import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: [
        "src/index.ts",
        "src/components",
        "src/helpers",
        "src/musicxml",
        "src/playback",
      ],
    }),
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        musicxml: resolve(__dirname, "src/musicxml/index.ts"),
        playback: resolve(__dirname, "src/playback/index.ts"),
      },
      name: "ReactMusicNotation",
      formats: ["es", "cjs"],
      fileName: (format, entryName) =>
        `${entryName}.${format === "es" ? "js" : "cjs"}`,
    },
    // one dist/style.css for consumers to import; the Leland woff2 inlines
    // into it as a data uri so there are no asset-path issues in node_modules
    cssCodeSplit: false,
    assetsInlineLimit: 1024 * 1024,
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});

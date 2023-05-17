import { defineConfig, Options } from "tsup";

export default defineConfig((options: Options) => ({
  publicDir: "./public",
  treeshake: true,
  splitting: true,
  entry: ["src/**/*.ts"],
  format: ["cjs"],
  dts: true,
  minify: true,
  clean: true,
  external: [
    "react",
    // "tailwindcss-animatem",
    // "class-variance-authority",
    // "clsx",
    // "tailwind-merge",
    // "lucide-react",
  ],
  ...options,
}));

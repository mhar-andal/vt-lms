import { defineConfig, Options } from "tsup";

export default defineConfig((options: Options) => ({
  treeshake: true,
  splitting: true,
  entry: ["src/**/*.tsx"],
  format: ["esm"],
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

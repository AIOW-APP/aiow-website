import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  {
    ignores: [
      ".next/**",
      ".next.*-*/**",
      ".quarantine/**",
      "node_modules/**",
      "public/_astro/**",
      "public/**/*.js",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
];

export default config;

import jsplugin from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  jsplugin.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },
];

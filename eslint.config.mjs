import globals from "globals";
import pluginJs from "@eslint/js";
import eslintPluginJquery from "eslint-plugin-jquery";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "script",
      globals: {
        ...globals.browser,
        $: "readonly",  // Declara $ como global de solo lectura
      },
    },
    plugins: {
      jquery: eslintPluginJquery,  // Carga el plugin de jQuery
    },
    rules: {
      "jquery/no-ajax": "off",  // Puedes personalizar las reglas de jQuery si lo deseas
    },
  },
  pluginJs.configs.recommended,
];

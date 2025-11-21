import next from "eslint-config-next";

export default [
  {
    ignores: ["**/.next/**", "**/node_modules/**", "**/dist/**", "supabase/.temp/**"],
  },
  ...next,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
      "@next/next/no-assign-module-variable": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
];

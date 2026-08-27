import next from "eslint-config-next";

const config = [
  ...next,
  {
    ignores: [
      ".wrangler/**",
      "out/**",
      "node_modules/**",
      ".next/**",
      "next-env.d.ts",
    ],
  },
];

export default config;

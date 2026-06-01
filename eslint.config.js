// ESLint v9 uses the "flat config" format by default.
// We delegate to Next.js' maintained config, then relax a couple rules that
// can be triggered by shadcn/ui's built-in component patterns.
const nextConfig = require("eslint-config-next")

module.exports = [
  ...nextConfig,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
  },
]


import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import replace from "rollup-plugin-replace";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

const baseConfig = {
  input: "index.js",
  external: ["react", "react-dom"],
  output: [
    { file: pkg.main, format: "cjs" },
    { file: pkg.module, format: "es" }
  ],
  plugins: [
    babel({
      ...require("./.babelrc"),
      exclude: "node_modules/**"
    }),
    resolve(),
    commonjs()
  ]
};

const browserConfig = {
  ...baseConfig,
  output: [
    { file: pkg.browser[pkg.main], format: "cjs" },
    { file: pkg.browser[pkg.module], format: "es" }
  ],
  plugins: [
    replace({
      "process.browser": JSON.stringify(true)
    }),
    ...baseConfig.plugins
  ]
};

export default [
  baseConfig,
  browserConfig,
  {
    ...browserConfig,
    output: [
      {
        file: pkg.browser[pkg.main].replace(/\.js$/, ".min.js"),
        format: "cjs"
      }
    ],
    plugins: [...browserConfig.plugins, terser()]
  },
  // FIXME: Due to a bug in rollup-plugin-terser, multiple outputs need to be
  // split into separate configurations.
  {
    ...browserConfig,
    output: [
      {
        file: pkg.browser[pkg.module].replace(/\.js$/, ".min.js"),
        format: "es"
      }
    ],
    plugins: [...browserConfig.plugins, terser()]
  }
];

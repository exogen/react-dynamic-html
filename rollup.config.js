import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import replace from "rollup-plugin-replace";
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

export default [
  baseConfig,
  {
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
  }
];

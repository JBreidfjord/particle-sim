const HtmlWebpackPlugin = require("html-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const path = require("path");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
  },
  devServer: {
    port: 8000,
    hot: true,
    static: "./build",
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve("./public/index.html"),
      filename: "index.html",
    }),
    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, "./libs/simulation-wasm/"),
    }),
  ],
  mode: "development",
  devtool: "inline-source-map",
  experiments: {
    asyncWebAssembly: true,
  },
  ignoreWarnings: [
    (warning) =>
      warning.message === "Critical dependency: the request of a dependency is an expression",
  ],
};

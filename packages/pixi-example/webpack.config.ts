import { Configuration } from "webpack";
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HTMLWebpackPlugin = require("html-webpack-plugin");

const path = require("path");

const config: Configuration = {
  entry: "./src/index.ts",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  target: "web",
  output: {
    filename: "main.js",
    publicPath: path.resolve(__dirname, "public"),
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: "images", to: "images" }],
    }),
    new HTMLWebpackPlugin({
      template: "public/index.html",
      filename: "index.html",
    }),
  ],
};

export default config;

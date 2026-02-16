// webpack.coverage.js
const path = require("path");

module.exports = (config) => {
  config.module.rules.push({
    test: /\.[jt]s$/,
    include: path.resolve(__dirname, "src"),
    exclude: [
      /\.spec\.ts$/,
      /src\/test\.ts$/,
      /src\/main\.ts$/,
      /src\/environments\//,
      /node_modules/,
    ],
    enforce: "post",
    use: {
      loader: "@jsdevtools/coverage-istanbul-loader",
      options: {
        esModules: true,
      },
    },
  });

  return config;
};

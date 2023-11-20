const path = require("path");
const CopyPlugin = require('copy-webpack-plugin');

module.exports = function (_env, argv) {
    const isProduction = argv.mode === "production";
    const isDevelopment = !isProduction;

    return {
        devtool: isDevelopment && "cheap-module-source-map",
        entry: "./src/main.jsx",
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "[name].bundle.js",
            publicPath: "/",
            clean: true
        },
        module: {
            rules: [
                {
                    test: /\.(?:js|jsx|ts)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            cacheDirectory: true,
                            cacheCompression: false,
                            envName: isProduction ? "production" : "development"
                        }
                    }
                }
            ]
        },
        resolve: {
            extensions: [".js", ".jsx", ".ts"]
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    { from: "public", to: "./" }
                ]
            })
        ]
    };
};
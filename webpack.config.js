const path = require("path");
const CopyPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = function (_env, argv) {
    const isProduction = argv.mode === "production";
    const isDevelopment = !isProduction;

    return {
        devtool: isDevelopment && "inline-source-map",
        entry: {
            popup: "./src/popup/popup.tsx",
            content: "./src/scripts/content.tsx",
        },
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "src/[name].bundle.js",
            publicPath: "/",
            clean: true
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx|ts|tsx)$/,
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
            extensions: [".js", ".jsx", ".ts", ".tsx"]
        },
        plugins: [
            new ForkTsCheckerWebpackPlugin({
                async: false
            }),
            new CopyPlugin({
                patterns: [
                    { from: "public", to: "./" }
                ]
            })
        ]
    };
};
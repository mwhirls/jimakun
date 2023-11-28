const path = require("path");
const CopyPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = function (_env, argv) {
    const isProduction = argv.mode === "production";
    const isDevelopment = !isProduction;

    return {
        devtool: isDevelopment && "inline-source-map",
        entry: {
            popup: "./src/popup/popup.tsx",
            content: "./src/content-scripts/content.tsx",
            interceptor: "./src/content-scripts/interceptor.ts",
            "service-worker": "./src/service-worker.ts",
        },
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "[name].bundle.js",
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
                },
                {
                    test: /\.css$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : "style-loader",
                        "css-loader",
                        "postcss-loader"
                    ]
                },
                {
                    test: /\.(svg)$/,
                    loader: require.resolve("file-loader"),
                    options: {
                        name: "web-accessible-resources/[name].[hash:8].[ext]"
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
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, "src/popup/popup.html"),
                inject: true,
                filename: "popup.html"
            }),
            new CopyPlugin({
                patterns: [
                    { from: "public", to: "./" }
                ]
            })
        ]
    };
};
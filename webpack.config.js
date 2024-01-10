const path = require("path");
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const CopyPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = function (_env, argv) {
    const isProduction = argv.mode === "production";
    const isDevelopment = !isProduction;
    const outputDir = path.resolve(__dirname, "dist");

    return {
        devtool: isDevelopment && "inline-source-map",
        entry: {
            popup: "./src/popup/popup.tsx",
            content: "./src/content-scripts/content.tsx",
            interceptor: "./src/content-scripts/interceptor.ts",
            "service-worker": "./src/service-worker.ts",
        },
        output: {
            path: outputDir,
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
                },
                {
                    test: /index.bundle\.js$/,
                    enforce: "pre",
                    use: ["source-map-loader"],
                },
            ]
        },
        resolve: {
            extensions: [".js", ".jsx", ".ts", ".tsx"],
            fallback: {
                path: require.resolve("path-browserify"),
                fs: false,
                zlib: false,
            }
        },
        plugins: [
            new WebpackShellPluginNext({
                onBuildStart: {
                    scripts: [`python fetch_dictionary.py`, `python fetch_examples.py`],
                    blocking: true,
                    parallel: false
                }
            }),
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
                    { from: "public", to: "./" },
                    { from: 'node_modules/kuromoji/dict', to: './dict' },
                ]
            })
        ]
    };
};
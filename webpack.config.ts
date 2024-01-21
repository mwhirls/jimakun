import path from 'path';
import webpack from 'webpack';
import WebpackShellPluginNext from 'webpack-shell-plugin-next';
import CopyPlugin from 'copy-webpack-plugin';
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import packageJSON from './package.json'

function updateChromeManifest(data: Buffer) {
    const manifest = JSON.parse(data.toString());
    manifest.name = packageJSON.name;
    manifest.description = packageJSON.description;
    manifest.version = packageJSON.version;
    return JSON.stringify(manifest, null, 2);
}

module.exports = (
    env: Record<string, unknown>,
    argv: Record<string, unknown>,
): webpack.Configuration => {
    const isProduction = argv.mode === "production";
    const isDevelopment = !isProduction;
    const outputDir = path.resolve(__dirname, "dist");

    return {
        devtool: isDevelopment && "inline-source-map",
        entry: {
            popup: "./src/popup/popup.tsx",
            options: "./src/options/options.tsx",
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
                    test: /\.svg$/i,
                    issuer: /\.[jt]sx?$/,
                    use: [{ loader: '@svgr/webpack', options: { icon: true, typescript: true } }],
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
                    scripts: [`python fetch_latest_data.py`],
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
                scriptLoading: 'module',
                filename: "popup.html",
                chunks: ["popup"]
            }),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, "src/options/options.html"),
                inject: true,
                scriptLoading: 'module',
                filename: "options.html",
                chunks: ["options"]
            }),
            new CopyPlugin({
                patterns: [
                    { from: "public", to: "./" },
                    {
                        from: "public/manifest.json",
                        to: "manifest.json",
                        transform(content) {
                            return updateChromeManifest(content);
                        }
                    },
                    { from: 'node_modules/kuromoji/dict', to: './dict' },
                ]
            }),
        ]
    }
}
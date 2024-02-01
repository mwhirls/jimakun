import path from 'path';
import webpack from 'webpack';
import WebpackShellPluginNext from 'webpack-shell-plugin-next';
import CopyPlugin from 'copy-webpack-plugin';
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import packageJSON from './package.json'
import DotenvWebpackPlugin from 'dotenv-webpack';

function updateChromeManifest(data: Buffer, production: boolean) {
    const buildNumber = process.env.BUILD_NUMBER && process.env.BUILD_NUMBER.length ? process.env.BUILD_NUMBER : '9999';
    const version = `${packageJSON.version}.${buildNumber}`;
    const manifest = JSON.parse(data.toString());
    manifest.version = version;
    manifest.content_scripts = [
        {
            "js": [
                "content.bundle.js"
            ],
            "css": production ? [
                "content.css"
            ] : [],
            "matches": [
                "https://www.netflix.com/*"
            ]
        },
        {
            "js": [
                "interceptor.bundle.js"
            ],
            "matches": [
                "https://www.netflix.com/*"
            ],
            "run_at": "document_start",
            "world": "MAIN"
        }
    ]
    return JSON.stringify(manifest, null, 2);
}

module.exports = (
    env: Record<string, unknown>,
    argv: Record<string, unknown>,
): webpack.Configuration => {
    const production = argv.mode === "production";
    const development = !production;
    const outputDir = path.resolve(__dirname, "dist");

    return {
        devtool: development && "inline-source-map",
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
                            envName: production ? "production" : "development"
                        }
                    }
                },
                {
                    test: /\.css$/,
                    use: [
                        production ? MiniCssExtractPlugin.loader : "style-loader",
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
            new DotenvWebpackPlugin({
                systemvars: true,
            }),
            new WebpackShellPluginNext({
                onBuildStart: {
                    scripts: [`python fetch_latest_data.py`],
                    blocking: true,
                    parallel: false
                }
            }),
            new MiniCssExtractPlugin(),
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
                            return updateChromeManifest(content, production);
                        }
                    },
                    { from: 'node_modules/kuromoji/dict', to: './dict' },
                    { from: "NOTICE.md", to: "./" },
                    { from: "LICENSE.txt", to: "./" },
                ]
            }),
        ]
    }
}
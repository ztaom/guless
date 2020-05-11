/// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/// @Copyright ~2020 ☜Samlv9☞ and other contributors
/// @MIT-LICENSE | 6.0.1 | https://developers.guless.com/
/// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const path = require("path");
const context = path.resolve(__dirname, "../www/");
const mergeWebpackConfiguration = require("webpack-merge");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const createDefaultWebpackConfiguration = require("./createDefaultWebpackConfiguration");

function createServerWebpackConfiguration(env = {}, argv = {}) {
    return mergeWebpackConfiguration(createDefaultWebpackConfiguration(env, argv), {
        context,
        mode: "development",
        entry: {
            "main": "./main.ts",
        },
        output: {
            path: context,
            filename: "[name].js",
        },
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "../src/"),
            },
        },
        devServer: {
            contentBase: context,
            host: "0.0.0.0",
            useLocalIp: true,
            disableHostCheck: true,
        },
        module: {
            rules: [
                {
                    test: /\.tsx?(\?.*)?$/i,
                    use: [
                        {
                            loader: "ts-loader",
                            options: {
                                configFile: path.resolve(context, "tsconfig.json"),
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            new HTMLWebpackPlugin({
                chunks: ["main"],
                title: "Hello World",
                template: path.resolve(context, "template.html"),
            }),
        ],
    });
}

module.exports = createServerWebpackConfiguration;

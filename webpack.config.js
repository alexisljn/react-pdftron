const path = require('path');
// const HtmlWebpackPlugin = require("html-webpack-plugin");
// const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
    target: ['web', 'es5'],
    output: {
        path: path.resolve(__dirname, 'web/dist'),
    },
    entry: { index: path.resolve(__dirname, "src", "index.js") }, //Permet de modifier l'entrypoint de Webpack
    module: {
        rules: [
            // {
            //     test: /\.scss$/,
            //     use: ["style-loader", "css-loader", "sass-loader"]
            // },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                }
            }
        ]
    },
    plugins: [
        // new HtmlWebpackPlugin({
        //     template: path.resolve(__dirname, 'src', 'index.html')
        // }),
        // new CompressionPlugin({
        // })
    ],
    // devtool: false
    // A CONDITIONNER
}
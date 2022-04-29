/* eslint-disable no-undef */
const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: {
        search: {
            import: './public/js/search.js',
            filename: './sequenceserver-search.min.js',
        },
        report: {
            import: './public/js/report.js',
            filename: './sequenceserver-report.min.js',
        },
    },
    output: {
        path: path.join(__dirname, 'public'),
    },
    mode: process.env.NODE_ENV || 'development',
    resolve: {
        modules: [path.resolve(__dirname, 'public', 'js'), 'node_modules'],
    },
    devServer: { contentBase: path.join(__dirname, 'public/js') },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.(css|scss)$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(jpg|jpeg|png|gif|mp3|svg)$/,
                use: ['file-loader'],
            },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
        }),
    ],
};

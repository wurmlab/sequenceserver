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
            import: './public/js/report_root.js',
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
            }
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
        }),
        new webpack.EnvironmentPlugin({ NODE_ENV: 'development' }),
        new webpack.DefinePlugin({
            process: { env: {} }
        }),
    ],
};

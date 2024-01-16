/* eslint-disable no-undef */
const path = require('path');
const webpack = require('webpack');

module.exports = (env, argv)  => {
    const reportPluginsPath = env.reportPluginsPath || './public/js/null_plugins/report_plugins.js';
    const downloadLinks = env.downloadLinks || './public/js/null_plugins/download_links.js';
    const hitButtons = env.hitButtons || './public/js/null_plugins/hit_buttons.js';

    return {
        entry: {
            search: {
                import: './public/js/search.js',
                filename: './sequenceserver-search.min.js',
            },
            report: {
                import: './public/js/report_root.js',
                filename: './sequenceserver-report.min.js',
            }
        },
        output: {
            path: path.join(__dirname, 'public'),
        },
        mode: process.env.NODE_ENV || 'development',
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
                process: { env: {} },
            })
        ],
        resolve: {
            modules: [path.resolve(__dirname, 'public', 'js'), path.resolve(__dirname, 'node_modules')],
            alias: {
                'report_plugins': path.resolve(__dirname, reportPluginsPath),
                'download_links': path.resolve(__dirname, downloadLinks),
                'hit_buttons': path.resolve(__dirname, hitButtons),
            }
        }
    };
};

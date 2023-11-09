/* eslint-disable no-undef */
const path = require('path');
const webpack = require('webpack');

module.exports = (env, argv)  => {
    const reportPluginsPath = env.reportPluginsPath || './public/js/null_report_plugins.js';

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
        resolve: {
            modules: [path.resolve(__dirname, 'public', 'js'), path.resolve(__dirname, 'node_modules')],
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
                process: { env: {} },
            })
        ],
        resolve: {
            alias: {
                'report_plugins': path.resolve(__dirname, reportPluginsPath),
                'react': path.resolve(__dirname, './node_modules/react/'),
                'underscore': path.resolve(__dirname, './node_modules/underscore/'),
                'jquery': path.resolve(__dirname, './node_modules/jquery/'),
                'd3': path.resolve(__dirname, './node_modules/d3/'),
            }
        }
    }
};

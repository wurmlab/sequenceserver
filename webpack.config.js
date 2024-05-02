/* eslint-disable no-undef */
const path = require('path');
const webpack = require('webpack');

module.exports = (env, argv)  => {
    const pluginsPath = env.pluginsPath || './public/js/null_plugins';

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
            publicPath: process.env.NODE_ENV === 'production' ? '//blast-dev.alliancegenome.org:4568/blast/' : '//localhost:4567/blast/'
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
            new webpack.EnvironmentPlugin({ NODE_ENV: 'development', targetEnv: env.targetEnv || 'standalone'}),
            new webpack.DefinePlugin({
                process: { env: {} },
            })
        ],
        resolve: {
            modules: [path.resolve(__dirname, 'public', 'js'), path.resolve(__dirname, 'node_modules')],
            alias: {
                'report_plugins': path.resolve(__dirname, pluginsPath, 'report_plugins.js'),
                'download_links': path.resolve(__dirname, pluginsPath, 'download_links.js'),
                'hit_buttons': path.resolve(__dirname, pluginsPath, 'hit_buttons.js'),
                'search_header_plugin': path.resolve(__dirname, pluginsPath, 'search_header_plugin.js'),
                'grapher': path.resolve(__dirname, './public/js', 'grapher.js'),
                'histogram': path.resolve(__dirname, pluginsPath, 'grapher', 'histogram.js'),
            }
        }
    };
};

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const c = require('./constants');

const tsModule = {
    test: /\.tsx?$/,
    use: 'ts-loader',
    exclude: /node_modules/,
};

const cssModule = {
    test: /\.css$/,
    use: [MiniCssExtractPlugin.loader, 'css-loader'],
};

const sassLoader = {
    loader: 'sass-loader',
}

const sassModule = {
    test: /\.(sass|scss)$/,
    use: [MiniCssExtractPlugin.loader, 'css-loader',sassLoader],
};

const imageModule = {
    test: /\.(png|jpe?g|gif)$/i,
    use: [
        {
            loader: 'file-loader',
        },
    ],
};

const filesModule = {
    test: /\.(ttf)$/i,
    use: [
        {
            loader: 'file-loader',
        },
    ],
};

module.exports = {
    mode: 'production',
    entry: {
        background: c.BACKGROUND_ENTRY_PATH,
        contentscript: c.CONTENT_ENTRY_PATH,
        popup: c.POPUP_ENTRY_PATH,
    },
    output: {
        path: c.BUILD_OUTPUT_PATH,
        filename: '[name].js',
    },
    module: {
        rules: [
            tsModule,
            cssModule,
            sassModule,
            imageModule,
            filesModule,
        ]
    },
    resolve: {
        extensions: [
            '.tsx', '.ts', '.js',
            '.png', '.jpeg', '.jpg', '.git',
        ],
        modules: [
            c.SRC_PATH,
            'node_modules',
        ],
        alias: {
            "react": "preact/compat",
            "react-dom/test-utils": "preact/test-utils",
            "react-dom": "preact/compat",
        }
    },
    plugins: [
        new webpack.DefinePlugin({
        }),
        new HtmlWebpackPlugin({
            template: c.POPUP_TEMPLATE_PATH,
            inject: 'head',
            excludeChunks: [ 'background' ],
            chunks: 'all'
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
    ],
};
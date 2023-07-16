const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

const path = require('path')
const package = require('./package.json')
const toolsVersion = package.version
const datebuilt = new Date().toLocaleString()

const dist = path.resolve(__dirname, 'dist')

module.exports = {
    mode: 'production',
    entry: './src/index.ts',
    output: {
        path: dist,
        filename: 'bundle.js',
    },
    module: {
        rules: [
            // For the typescript files, we don't want anything in the node_modules directory
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                },
                include: [path.resolve(__dirname, 'src')],
            },
            {
                test: /\.js$/i,
                include: path.resolve(__dirname, 'src'),
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            {
                test: /\.css$/i,
                include: path.resolve(__dirname, 'src'),
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
        ],
    },
    resolve: {
        modules: [__dirname, path.join(__dirname, 'node_modules')],
        extensions: ['.ts', '.tsx', '.js', '.css', '.eot', '.png', '.svg', '.json'],
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.join(__dirname, 'src', 'include', 'Inc150'),
                    to: path.resolve(__dirname, 'dist', 'include', 'Inc150'),
                },
                {
                    from: path.join(__dirname, 'src', 'include', 'Inc150s'),
                    to: path.resolve(__dirname, 'dist', 'include', 'Inc150s'),
                },
                {
                    from: path.join(__dirname, 'src', 'siteVersion.txt'),
                    to: path.resolve(__dirname, 'dist', 'siteVersion.txt'),
                    transform(content) {
                        return content
                            .toString()
                            .replace('__VERSION__', JSON.stringify(toolsVersion))
                    },
                },
            ],
        }),
        new webpack.DefinePlugin({
            __VERSION__: JSON.stringify(toolsVersion),
            __DATE_BUILT__: JSON.stringify(datebuilt),
        }),
        //=====================================================================
        //
        // HTML Files
        //
        //=====================================================================
        new HtmlWebpackPlugin({
            inject: false,
            filename: 'index.html',
            template: path.join(__dirname, 'src', 'pages', 'index.html'),
            title: 'Datalink Online Assembler',
        }),
        new webpack.DefinePlugin({
            'require.specified': 'require.resolve',
        }),
    ],
    devServer: {
        static: 'dist',
    },
}

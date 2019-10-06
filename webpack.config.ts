import * as webpack from 'webpack'
import * as path from 'path'

const config: webpack.Configuration = {
    entry: './src/app/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'convious-pricing-analytics.js',
        library: 'conviousPricing',
        libraryTarget: 'umd',
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV),
                CHARON_URL: JSON.stringify('wss://charon.convious.com'),
            }
        })
    ],
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        }]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },
}

export default config

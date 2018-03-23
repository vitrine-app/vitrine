const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const serverConfig = require('./webpack.server.config');
const clientConfig = require('./webpack.client.config');

module.exports = [
	{
		...serverConfig,
		module: {
			loaders: [
				{
					test: /\.ts?$/,
					loader: 'ts-loader'
				},
				{
					test: /\.node?$/,
					use: 'electron-node-loader?prod=true'
				}
			]
		},
		plugins: [
			new UglifyJsPlugin({
				sourceMap: true
			})
		]
	},
	{
		...clientConfig[0],
		plugins: [
			new UglifyJsPlugin({
				sourceMap: true
			})
		]
	},
	{
		...clientConfig[1],
		plugins: [
			new UglifyJsPlugin({
				sourceMap: true
			})
		]
	}
];

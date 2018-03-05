const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const serverConfig = require('./webpack.server.config');
const clientConfig = require('./webpack.client.config');

module.exports = [
	{
		...serverConfig,
		output: {
			filename: 'public/server.min.js'
		},
		plugins: [
			new UglifyJsPlugin({
				sourceMap: true
			})
		]
	},
	{
		...clientConfig[0],
		output: {
			filename: 'public/client.min.js'
		},
		plugins: [
			new UglifyJsPlugin({
				sourceMap: true
			})
		]
	},
	{
		...clientConfig[1],
		output: {
			filename: 'public/loader.min.js'
		},
		plugins: [
			new UglifyJsPlugin({
				sourceMap: true
			})
		]
	}
];

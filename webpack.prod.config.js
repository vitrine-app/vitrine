const serverConfig = require('./webpack.server.config');
const clientConfig = require('./webpack.client.config');

module.exports = [
	{
		...serverConfig,
		module: {
			rules: [
				{
					test: /\.ts?$/,
					use: 'awesome-typescript-loader'
				},
				{
					test: /\.node?$/,
					use: [
						{
							loader: 'electron-node-loader',
							options: {
								folder: 'scripts',
								prod: true
							}
						}
					]
				}
			]
		},
		mode: 'production'
	},
	{
		...clientConfig[0],
		mode: 'production'
	},
	{
		...clientConfig[1],
		mode: 'production'
	}
];

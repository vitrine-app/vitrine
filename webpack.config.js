module.exports = [
	/* Server build process */
	{
		entry: './assets/ts/server/main.ts',
		output: {
			filename: 'main.js'
		},
		node: {
			__dirname: false,
			__filename: false
		},
		resolve: {
			extensions: ['.ts', '.js', '.json']
		},
		target: "electron-main",
		module: {
			loaders: [
				{
					test: /\.ts?$/,
					loader: 'awesome-typescript-loader'
				}
			]
		}
	}
];

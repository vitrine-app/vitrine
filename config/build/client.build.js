module.exports = {
	entry: './assets/ts/client/main.ts',
	output: {
		filename: 'public/client.js'
	},
	node: {
		__dirname: false,
		__filename: false
	},
	resolve: {
		extensions: ['.ts', '.js', '.json']
	},
	target: "electron-renderer",
	module: {
		loaders: [
			{
				test: /\.ts?$/,
				loader: 'awesome-typescript-loader'
			}
		]
	}
};

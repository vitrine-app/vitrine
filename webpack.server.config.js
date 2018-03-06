module.exports = {
	entry: './assets/server/main.ts',
	output: {
		filename: 'public/server.js'
	},
	node: {
		__dirname: false,
		__filename: false
	},
	resolve: {
		extensions: ['.ts', '.js', '.json']
	},
	target: 'electron-main',
	module: {
		loaders: [
			{
				test: /\.ts?$/,
				loader: 'ts-loader'
			}
		]
	}
};

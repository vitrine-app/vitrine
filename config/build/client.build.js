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
		extensions: ['.ts', '.js']
	},
	target: 'electron-renderer',
	module: {
		rules: [
			{
				test: /\.ts?$/,
				loader: 'awesome-typescript-loader'
			},
			{
				test: /\.(css|scss)?$/,
				use: [
					{
						loader: 'css-loader'
					},
					{
						loader: 'sass-loader'
					}
				]
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf|svg)(.*?)?$/,
				loader: 'base64-font-loader'
			}
		]
	}
};

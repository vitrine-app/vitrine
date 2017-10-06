module.exports = {
	entry: './assets/client/main.tsx',
	output: {
		filename: 'public/client.js'
	},
	node: {
		__dirname: false,
		__filename: false
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js']
	},
	target: 'electron-renderer',
	module: {
		rules: [
			{
				test: /\.(ts|tsx)?$/,
				loader: 'ts-loader'
			},
			{
				test: /\.(css|scss)?$/,
				use: [
					{
						loader: 'style-loader'
					},
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

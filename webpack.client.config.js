const path = require('path');

let clientConfig = {
	node: {
		__dirname: false,
		__filename: false
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js'],
		alias: {
			'../../theme.config$': path.join(__dirname, 'assets/client/resources/less/theme.config.less')
		}
	},
	target: 'electron-renderer',
	module: {
		rules: [
			{
				test: /\.(ts|tsx)?$/,
				loader: 'ts-loader'
			},
			/*{
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
			},*/
			{
				test: /\.less$/,
				use: [
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader'
					},
					{
						loader: 'less-loader'
					}
				]
			},
			{
				test: /\.(jpe?g|png|gif|ico|woff|woff2|eot|ttf|otf|svg)(.*?)?$/,
				loader: 'base64-inline-loader?name=[name].[ext]'
			}
		]
	},
	devtool: 'source-map'
};

module.exports = [
	{
		entry: './assets/client/main.tsx',
		output: {
			filename: 'public/client.js'
		},
		...clientConfig
	}/*,
	{
		entry: './assets/client/loader.tsx',
		output: {
			filename: 'public/loader.js'
		},
		...clientConfig
	}*/
];

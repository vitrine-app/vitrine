const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');

let clientConfig = {
	node: {
		__dirname: false,
		__filename: false
	},
	resolve: {
		extensions: [ '.ts', '.tsx', '.js' ],
		alias: {
			'../../theme.config$': path.join(__dirname, 'assets/client/resources/less/theme.config.less')
		}
	},
	target: 'electron-renderer',
	module: {
		rules: [
			{
				test: /\.(ts|tsx)?$/,
				use: 'awesome-typescript-loader'
			},
			{
				test: /\.less$/,
				use: [
					{ loader: 'style-loader' },
					{ loader: 'css-loader' },
					{ loader: 'less-loader' }
				]
			},
			{
				test: /\.(jpe?g|png|gif|ico|woff|woff2|eot|ttf|otf|svg)(.*?)?$/,
				use: 'base64-inline-loader?name=[name].[ext]'
			}
		]
	},
	mode: 'development'
};

module.exports = [
	{
		entry: './assets/client/main.tsx',
		output: {
			path: path.resolve(__dirname, 'public'),
			filename: 'client.js'
		},
		...clientConfig,
		plugins: [
			new HtmlPlugin({
				title: 'Vitrine',
				filename: 'client.html'
			})
		]
	},
	{
		entry: './assets/client/loader.tsx',
		output: {
			path: path.resolve(__dirname, 'public'),
			filename: 'loader.js'
		},
		...clientConfig,
		plugins: [
			new HtmlPlugin({
				title: 'Vitrine',
				filename: 'loader.html'
			})
		]
	},
];

const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');

const production = process.env.NODE_ENV === 'production';

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
	mode: (production) ? ('production') : ('development'),
	devtool: (production) ? ('source-map') : (false)
};

module.exports = [
	{
		...clientConfig,
		entry: './assets/client/main.tsx',
		output: {
			path: path.resolve(__dirname, 'public'),
			filename: 'client.js'
		},
		plugins: [
			new HtmlPlugin({
				title: 'Vitrine',
				filename: 'client.html'
			})
		]
	},
	{
		...clientConfig,
		entry: './assets/client/loader.tsx',
		output: {
			path: path.resolve(__dirname, 'public'),
			filename: 'loader.js'
		},
		plugins: [
			new HtmlPlugin({
				title: 'Vitrine',
				filename: 'loader.html'
			})
		]
	},
];

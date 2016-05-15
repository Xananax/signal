var ExtractTextPlugin = require("extract-text-webpack-plugin");
var webpack = require('webpack');
var precss = require('precss');
var autoprefixer = require('autoprefixer');

var PROD = (process.env.NODE_ENV === 'production');
var NOT_PROD = !PROD;

module.exports = {
	entry:{
		bundle:[
			NOT_PROD && 'webpack-dev-server/client?http://localhost:8080'
		,	NOT_PROD && 'webpack/hot/only-dev-server'
		,	'./index.js'
		].filter(Boolean)
	}
, 	output:{
		publicPath: 'http://localhost:8080/'
	,	path: __dirname + "/public"
	, 	filename: '[name].js'
	}
,	devtool: 'source-map'
,	plugins:[
		PROD && new webpack.optimize.UglifyJsPlugin({
			compress: { warnings: false }
		})
	,	PROD && new webpack.optimize.DedupePlugin()
	,	new ExtractTextPlugin("style.css")
	].filter(Boolean)
,	webpackMiddleware:{
		noInfo:true
	}
,	postcss: function () {
		return {
			prefix:[precss, autoprefixer]
		};
	}
,	module: {
		preLoaders:[
			{
				test: /\.(ts|js)x?$/
			,	exclude: /(node_modules)/
			,	loader: 'source-map'
			}
		]
	,   loaders:[
			{
				test: /\.styl$/
			,	exclude: /(node_modules)/
			,	loader: ExtractTextPlugin.extract(
					'style-loader'
				,	'css-loader'
				,	'autoprefixer?browsers=last 3 versions'
				,	'stylus-loader'
				)
			}
		,	{
				test: /\.less$/
			,	exclude: /(node_modules)/
			,	loader: ExtractTextPlugin.extract(
				//	'style-loader'
					'css?sourceMap!' // with css modules: 'css?sourceMap&modules&importLoaders=1!'
				+	'postcss?pack=prefix!'
				+	'less?sourceMap'
				)
			}
		,   {
				test: /\.tsx?$/
			,	exclude: /(node_modules)/
			,	loaders:[
					'babel'
				,	'ts-loader'
				]
			}
		,   {
				test: /\.js$/
			,	exclude: /(node_modules)/
			,	loaders:[
					'babel'
				]
			}
		]
	}
,	resolve: {
		extensions:[
			""
		,	".webpack.js"
		,	".web.js"
		,	".js"
		,	".jsx"
		,	".ts"
		,	".tsx"
		,	".styl"
		,	".less"
		]
	}
};

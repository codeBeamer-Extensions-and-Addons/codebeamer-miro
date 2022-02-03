const path = require("path");

module.exports = {
	mode: "production",
	entry: {
		init: "./src/init.ts",
		settings: "./src/pages/settings/settings.ts",
		picker: "./src/pages/picker/picker.ts",
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js", ".css"],
	},
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "dist"),
	},
};

const outputConfig = {
    destPath: "./../dist"
};

// Entry points
// https://webpack.js.org/concepts/entry-points/ 
const entryConfig = [
    "./src/index.ts",
    "./src/recorderWorker.js",
];


// Copy files from src to dist
// https://webpack.js.org/plugins/copy-webpack-plugin/
const copyPluginPatterns = {
    patterns: [
        { from: "./src/assets/audio", to: "audio" },
        //{ from: "./src/assets/fonts", to: "fonts" },
        //{ from: "./src/assets/gltf", to: "gltf" },
        { from: "./src/assets/img", to: "img" },
        { from: "./src/assets/css", to: "css" },
        { from: "./src/assets/js", to: "" },
    ]
};


// Dev server setup
// https://webpack.js.org/configuration/dev-server/
const devServer = {

    static: outputConfig.destPath,
    // https: true,
    // port: "8080",
    // host: "0.0.0.0",
    // disableHostCheck: true
};


// SCSS compile
const scssConfig = {
    destFileName: "css/style.css"
};


// Production terser config options
// https://webpack.js.org/plugins/terser-webpack-plugin/#terseroptions
const terserPluginConfig = {
    extractComments: false,
    terserOptions: {
        compress: {
            drop_console: true,
        },
    }
};

module.exports.copyPluginPatterns = copyPluginPatterns;
module.exports.entryConfig = entryConfig;
module.exports.scssConfig = scssConfig;
module.exports.devServer = devServer;
module.exports.terserPluginConfig = terserPluginConfig;
module.exports.outputConfig = outputConfig;
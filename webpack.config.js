var path = require('path');

module.exports =  {
    entry: path.join(__dirname, '/src/index.js'),
    output: {
        path: path.join(__dirname, '/dist'),
        filename: 'fermat.js'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
        }]
    },
    resolve: {
        root: __dirname + '/src',
        fallback: [path.join(__dirname, '../core.js/src')],
        extensions: ['', '.js']
    },
    resolveLoader: {
        modulesDirectories: [path.join(__dirname, 'node_modules')]
    },
    devtool: 'sourcemap'  // 'eval', 'cheap-source-map'
};

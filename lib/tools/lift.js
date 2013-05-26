module.exports = {
    matchCommand: ['lift', 'raise', 'launch', 'start', 'server', 'run', 's', 'l'],
    help: [
        ['sails lift', 'Run this Sails app (in the current dir)'],
        ['  [--dev]', 'with development environment specified'],
        ['  [--prod]', 'with development environment specified'],
    ],
    execute: function(sails,args) {
        var path = require("path");
        return require(path.join(__dirname, "..", "..", "bin", "lift"))(args);
    }
}
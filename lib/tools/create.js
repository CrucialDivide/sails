module.exports = {
    matchCommand: function(args) {
        //console.log("Args", args);
        return (args._[0] && args._[0].match(/^new$/));
    },
    help: ['sails new <appName>', 'Create a new Sails project in the current dir'],
    execute: function(sails, args) {
        var path = require("path");
        sails.utils.verifyArg(1, "Please specify the name of the new project directory to create: e.g.\n sails new <appName>");

        // Default to ejs templates for new projects, but allow user to override with --template
        var template = 'ejs';
        if (args.template) {
            template = args.template;
        }
        require(path.join(__dirname, "..","..", "bin", "new"))(args._[1], template);
    }
}

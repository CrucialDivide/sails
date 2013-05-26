module.exports = {
    matchCommand: ['console'],
    help: ['sails console', 'Run this Sails app (in the current dir & in interactive mode.)'],
    execute: function(sails, args) {
        var path = require("path");

        sails.log.ship();
        sails.log('Welcome to Sails (v'+sails.version +')');
        sails.log('( to exit, type <CTRL>+<C> )');

        // TODO: instead of lifting the servers, just fire up the ORM and include all the modules
        require(path.join(__dirname, "..", "..", "bin", "sails")).lift({
            log: {
                level: 'silent'
            }
        }, function() {
            repl = require("repl").start("sails> ");
            repl.on('exit', function() {
                sails.log.verbose('Closing console');
                process.exit();
            });
        });
        return; //exit before accidently starting a second sails.
    }
}
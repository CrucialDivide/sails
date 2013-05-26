module.exports = {
    matchCommand: ['v', 'version'],
    help: ['sails version', 'Get the current globally installed Sails version'],
    execute: function(sails, args) {
        sails.log.info('v' + sails.version);
        return; //exit before accidently starting a second sails.
    }
}
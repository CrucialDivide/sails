module.exports = {
    matchCommand: function(args) {
        //console.log("Args", args);
        return (args._[0] && args._[0].match(/^g$|^ge$|^gen$|^gene$|^gener$|^genera$|^generat$|^generate$/) || args.g || args.generate);
    },
    help: [
        ['sails generate <foo>', 'Generate api/models/Foo.js and api/controllers/FooController.js'],
        ['sails generate model <foo>', 'Generate api/models/Foo.js'],
        ['sails generate controller <foo>', 'Generate api/controllers/FooController.js']
    ],
    execute: function(sails, passedArgs) {

        var path = require("path");
        var _ = require('lodash');
        _.str = require('underscore.string');
        var generate = require(path.join(__dirname, "..", "..", "bin", 'generate'));

        sails.utils.verifyArg(1, 'Please specify the name for the new model and controller as the second argument.');

        // Generate a model
        if (passedArgs._[1] === 'model') {
            var entity = passedArgs._[2];
            sails.utils.verifyArg(2, 'Please specify the name for the new model as the third argument.');

            // Figure out attributes based on args
            var options = _.extend({}, passedArgs);
            var args = passedArgs._.splice(3);
            options.attributes = [];
            _.each(args,function(attribute,i){
                var parts = attribute.split(':');
                if (!parts[1]) {
                    sails.log.error('Please specify the type for attribute '+(i+1)+ ' "'+parts[0]+'".');
                    process.exit(1);
                }
                options.attributes.push({
                    name: parts[0],
                    type: parts[1].toUpperCase()
                });
            });

            sails.log.warn('In order to serve the blueprint API for this model, you must now also generate an empty controller.');
            sails.log.warn('If you want this behavior, run \'sails generate controller '+ entity +'\' to create a blank controller.');
            generate.generateModel(entity, options);
        }

        // Generate a controller
        else if (passedArgs._[1] === 'controller') {
            var entity = passedArgs._[2];
            sails.utils.verifyArg(2, 'Please specify the name for the new controller as the third argument.');

            // Figure out actions based on args
            var options = _.extend({}, passedArgs);
            options.actions = passedArgs._.splice(3);

            generate.generateController(entity, options);
        }

        // // Generate a view
        // else if(argv._[1] === 'view') {
        //  var entity = argv._[2];
        //  verifyArg(2, "Please specify the name for the new view as the third argument.");
        //  // Figure out actions based on args
        //  var options = _.extend({},argv);
        //  options.actions = argv._.splice(3);
        //  generate.generateView(entity, options);
        // }

        // Generate an adapter
        else if (passedArgs._[1] === 'adapter') {
            var entity = passedArgs._[2];
            sails.utils.verifyArg(2, "Please specify the name for the new argument as the third argument.");

            // Figure out attributes based on args
            var options = _.extend({}, passedArgs);
            generate.generateAdapter(entity, options);
        }
        // Otherwise generate a model and controller
        else {
            var entity = passedArgs._[1];
            sails.utils.verifyArg(1, "Please specify the name of the entity as the second argument to generate a model, controller, and view.");
            sails.log.info("Generating model and controller for " + entity);

            var options = _.extend({}, passedArgs);
            options.actions = passedArgs._.splice(2);

            generate.generateModel(entity, options);
            generate.generateController(entity, options);
        }
    }
}


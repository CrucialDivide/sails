#!/usr/bin/env node
'use strict';

// Dependencies
var _ = require('lodash');
_.str = require('underscore.string');
var ejs = require('ejs');
var fs = require('fs-extra');
var utils = require('./utils.js');
var forever = require('forever');
var async = require("async");
var path = require("path");

// Make existsSync not crash on older versions of Node
fs.existsSync = fs.existsSync || require('path').existsSync;

var argv = require('optimist').argv;
require('coffee-script');

// Build mock sails object
var sails = require('./mockSails.js');

// Stringify args
argv._ = _.map(argv._, function(arg) {
	return arg + '';
});

// Known errors
var errors = {
	badLocalSails: function(requiredVersion) {
		return 'You may consider reinstalling Sails locally (npm install sails@' + requiredVersion + ').';
	}
};

// Read package.json file in specified path
function getPackage(path) {
	path = _.str.rtrim(path, '/');
	var packageJson = fs.readFileSync(path + '/package.json', 'utf-8');
	try {
		packageJson = JSON.parse(packageJson);
	} catch (e) {
		return false;
	}
	return packageJson;
}

// Iterate through the lib/tools folder for the commands
//   searchPath is an array of paths
function fetchCommands(searchPaths) {
    var path = require("path"),
        fs = require("fs"),
        foundCommands = [];

    //console.log("searchPaths", searchPaths);
    foundCommands = _.map(searchPaths,
        function(searchPath){
            var commandFiles = fs.readdirSync(path.join(searchPath));

            //console.log("commandFiles", commandFiles);
            foundCommands = commandFiles.map(
                function(commandFile) {
                    return require(path.join(searchPath, commandFile));
                }
            )
            return foundCommands;
        }
    )

    //console.log("FoundCommands", _.flatten(foundCommands));
    return _.flatten(foundCommands);
}

// Verify that an argument exists
function verifyArg(argNo, msg) {
    if (!argv._[argNo]) {
        sails.log.error(msg);
        process.exit(1);
    }
}

// Attach to utils - create if it doesn't exist
if (!sails.utils) {
    sails.utils = {};
}
sails.utils.verifyArg = verifyArg;

// Give ourselves a root to work with
var sailsRoot = path.join(__dirname, "..");
var searchPaths = [path.join(sailsRoot, "lib", "tools")];

if (sails.paths) {
    searchPaths.push(sails.paths.config);
}

var knownCommands = fetchCommands(searchPaths);
//var knownCommands = fetchCommands("../lib/tools/");

var isCommandMatched = async.detect(
    knownCommands,
    function(command, cb) {
        if (_.isString(command.matchCommand) || _.isArray(command.matchCommand)) {
            // strings & arrays are tested with just _.contains
            cb(_.contains(command.matchCommand, argv._[0]));
        } else if (_.isFunction(command.matchCommand)) {
            // if it's a function - it should return true|false|null - true if its a match
            cb(command.matchCommand(argv));
        }
    },
    function(matchedCommand) {
        //console.log("isCommandMatched:results", matchedCommand);

        if (!_.isUndefined(matchedCommand)) {
            // We have a winner
            //sails.log.info("We have a Winner!");
            matchedCommand.execute(sails, argv);
        } else {
            // Basic usage
            if (argv._.length === 0) {
                console.log('');
                sails.log('Welcome to Sails! (v'+sails.version + ')');
                console.log('');
            } else {
                console.log('');
                sails.log.error (argv._[0] + ' is not a valid action.');
            }
            sailsUsage(knownCommands);
        }
    }
)

// Display usage
function sailsUsage(knownCommands) {
    // fallback to showing help
    function leftColumn (str) {
        var n = (33-str.length);
        return str + _.str.repeat(' ',n);
    }

    var usage = 'Usage: sails <command>\n\n';

    _.each(
        knownCommands,
        function(command) {
            // If the first item is an array - then we have an array or arrays
            if (_.isArray(_.first(command.help))) {
                _.each(
                    command.help,
                    function(helpLine){
                        //console.log("HelpLine.0", helpLine);
                        usage += leftColumn(helpLine[0]) + helpLine[1] + '\n';
                    }
                )
            } else {
                var helpLine = command.help;
                //console.log("helpLine.1", command, helpLine);
                usage += leftColumn(command.help[0]) + command.help[1] + '\n';
            }
        }
    )

    sails.log.info(usage);
}

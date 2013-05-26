module.exports = {
    matchCommand: ['upgrade'],
    help: ['sails upgrade', 'Upgrade the current version of sails'],
    execute: function(sails, args) {
        var sys = require('sys');
        var exec = require('child_process').exec;
        var child;
        var http = require('http');
        var newest;
        var current;
        var options = {
            host: 'registry.npmjs.org',
            port: 80,
            path: '/sails'
        };
        http.get(options, function(res) {
            var jsond = '';
            var body = '';
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                jsond = JSON.parse(body);
                if (jsond['dist-tags'].latest > sails.version) {
                    // executes `pwd`
                    child = exec("npm install sails@" + jsond['dist-tags'].latest, function (error, stdout, stderr) {
                        if (error !== null) {
                            console.log('exec error: ' + error);
                        }
                        console.log("Upgrade Complete:  You are now on Sails Version: "+jsond['dist-tags'].latest);
                    });
                } else {
                    console.log("Already Up To Date");
                }
            });
        }).on('error', function(e) {
            console.error(e);
        });
    }
}

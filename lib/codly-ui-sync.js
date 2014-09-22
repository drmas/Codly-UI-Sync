var config = require('./config'),
    configData = config.read(),
    request = require("request"),
    cookieJar = request.jar(),
    readline = require('readline'),
    fs = require('fs'),
    unzip = require('unzip'),
    wrench = require('wrench'),
    util = require('util'),
    path = require('path-extra'),
    tmpFolder;

exports.excute = function(program) {
    if (program.login) {
        saveLogin(program);
    } else {
        login(function(err) {

            if (program.sync)
                getApps(program);

        })
    }


}

function saveLogin(program) {
    if (!program.username) {
        console.log('Please provide your username using -u or --username argument');
        return;
    }

    if (!program.password) {
        console.log('Please provide your password using -p or --password argument');
        return;
    }

    configData.username = program.username;
    configData.password = program.password;

    config.write(configData);
}

function login(cb) {
    request({
        uri: configData.apiURL + "/api/session",
        method: "POST",
        form: {
            email: configData.username,
            password: configData.password
        },
        jar: cookieJar,
        timeout: 10000
    }, function(error, response, body) {
        if (error)
            console.log(error);
        else
            cb && cb();

    });
}

function getApps(program) {
    request({
        uri: configData.apiURL + "/api/app",
        method: "GET",
        timeout: 10000,
        jar: cookieJar
    }, function(error, response, body) {
        if (error) {
            console.log(error);
            return;
        }

        var apps = JSON.parse(body);
        for (var i = 0, app; i < apps.length; i++) {
            app = apps[i];
            console.log((1 + i) + ". " + app.title);
        };

        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question("Type App index to sync with: ", function(answer) {
            var idx = parseInt(answer, 10);
            if (idx > 0) {

                var app = apps[idx - 1];
                var tmpFile = createTempFile(app);

                request.get({
                    uri: configData.apiURL + "/api/app/preview/ti/" + app._id,
                    jar: cookieJar,
                    followRedirect: true
                }, function() {
                    extractFile(app);
                }).pipe(tmpFile);


            } else {
                console.log('Incorrect App index');
            }

            rl.close();
        });

    });
}

function createTempFile(app) {
    tmpFolder = path.homedir() + '/codly-sync-tmp';

    if (fs.existsSync(tmpFolder))
        wrench.rmdirSyncRecursive(tmpFolder);

    fs.mkdirSync(tmpFolder);
    return fs.createWriteStream(tmpFolder + '/' + app._id + '.zip');


}

function extractFile(app) {
    if (fs.existsSync(tmpFolder + '/' + app._id))
        wrench.rmdirSyncRecursive(tmpFolder + '/' + app._id);

    var unzipExtractor = unzip.Extract({
        path: tmpFolder + '/' + app._id
    });

    unzipExtractor.on('close', function() {

        copyUI(app);
    });

    fs.createReadStream(tmpFolder + '/' + app._id + '.zip').pipe(unzipExtractor);
}

function copyUI(app) {
    console.log('Copying assets');
    wrench.copyDirSyncRecursive(tmpFolder + "/" + app._id + "/app/assets", "./app/assets", {
        forceDelete: true
    });

    console.log('Copying views');
    wrench.copyDirSyncRecursive(tmpFolder + "/" + app._id + "/app/views", "./app/views", {
        forceDelete: true
    });

    console.log('Copying styles');
    wrench.copyDirSyncRecursive(tmpFolder + "/" + app._id + "/app/styles", "./app/styles", {
        forceDelete: true
    });

}
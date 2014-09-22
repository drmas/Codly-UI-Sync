var fs = require('fs'),
    path = require('path-extra'),
    configFile;

var defaultOptions = {
    apiURL: 'http://localhost:9000'
};
configFile = path.homedir() + '/.codly-ui-sunc-config.json';


exports.write = function(data) {
    fs.writeFileSync(configFile, JSON.stringify(data));
    console.log('Configuration saved successfully.')
}

exports.read = function() {

    if (fs.existsSync(configFile)) {

        var data = fs.readFileSync(configFile);
        try {
            var configData = JSON.parse(data);
            return configData;
        } catch (err) {
            console.log('error parsing data json');
            console.log(err);
        }

    } else {
        exports.write(defaultOptions);
        return defaultOptions;
    }
}
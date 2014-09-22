#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander'),
    app = require('./lib/codly-ui-sync');


program
    .version('0.0.1')
    .option('-l, --login', 'login to your Codly account')
    .option('-u, --username [username]', 'You username')
    .option('-p, --password [password]', 'Your password')
    .option('-s, --sync', 'Sync with one of your apps')
    .parse(process.argv);

app.excute(program);
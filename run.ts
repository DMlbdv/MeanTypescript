/// <reference path="types/node.d.ts" />
/// <reference path="types/Q.d.ts" />

import server = require('./server/server');
import database = require('./server/database/database');
var appServer:any;
var configFile = './server/config/config.json';

var cfg = require(configFile);

var dirpath = __dirname;
var app = new server.Server({
    environment: cfg.environment,
    port: cfg.port,
    server: cfg.server,
    isSSL: cfg.isSSL,
    requestType: function () {
        if (cfg.isSSL) return 'https';
        return 'http';
    },
    socketIOEnabled: cfg.socketIOEnabled,
    staticFilePath: cfg.staticFilePath,
    cookie: cfg.cookie,
    cors: cfg.cors
}, dirpath);
var promise = app.startup({
    userName: cfg.userName,
    password: cfg.password,
    databasePortNumber: cfg.databasePortNumber,
    databaseUrl: cfg.databaseUrl,
    isSSL: cfg.dbIsSSL,
    databaseName: cfg.databaseName
});
promise.then(function (server) {
    appServer = server;

}, function (err) {
    console.log('Error: ' + err);
});

process.on('uncaughtException', function (err) {
    console.error('Error: ' + err);
    appServer.close();
    setTimeout(process.exit, 5000, 1);
});

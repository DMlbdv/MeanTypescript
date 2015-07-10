/**
 * Created by Michael on 7/10/2015.
 */
'use strict';
var mocha = require('mocha'), chai = require('chai'), sinon = require('sinon'), expect = chai.expect,
assert = chai.assert;
chai.should();

describe('server tests', function () {
    var databaseConfig, serverConfig, cfg, Server, dirName;

    beforeEach(function () {
        Server = require('../server/server'),
            cfg = require('../server/config/config.json'),
            databaseConfig = {
                userName: cfg.userName,
                password: cfg.password,
                databasePortNumber: cfg.databasePortNumber,
                databaseUrl: cfg.databaseUrl,
                isSSL: cfg.dbIsSSL,
                databaseName: cfg.databaseName
            }, serverConfig = {
            environment: cfg.environment,
            port: cfg.port,
            server: cfg.server,
            isSSL: cfg.isSSL,
            requestType: function () {
                if (cfg.isSSL)
                    return 'https';
                return 'http';
            },
            socketIOEnabled: cfg.socketIOEnabled,
            staticFilePath: cfg.staticFilePath,
            cookie: cfg.cookie,
            cors: cfg.cors
        },
            dirName = __dirname;

    });

    it('should have a constructor that returns a server object', function () {
        var server = new Server.Server(serverConfig, dirName);
        expect(server).not.to.be.null;
        expect(server).to.respondTo('startup');

    });

    it('should have a startup method returning an object', function () {
        var server = new Server.Server(serverConfig, dirName);
        var result = server.startup(databaseConfig);
        expect(result).not.to.be.null;

    })
});


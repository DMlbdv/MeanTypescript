/**
 * Created by Michael on 7/6/2015.
 */
/// <reference path="../types/Q.d.ts" />
/// <reference path="../types/node.d.ts" />
/// <reference path="../types/morgan.d.ts" />
/// <reference path="../types/express.d.ts" />
/// <reference path="../types/mongoose.d.ts" />
/// <reference path="../types/morgan.d.ts" />
/// <reference path="../types/body-parser.d.ts" />
/// <reference path="../types/method-override.d.ts" />
/// <reference path="../types/compression.d.ts" />
/// <reference path="../types/errorhandler.d.ts" />
/// <reference path="../types/cookie-parser.d.ts" />
/// <reference path="../types/lodash.d.ts" />

import Q = require('q');
import express = require('express');
import morgan = require('morgan');
import bodyParser = require('body-parser');
import methodOverride = require('method-override');
import compression = require('compression');
import errorHandler = require('errorhandler');
import cookieParser = require('cookie-parser');
import http = require('http');
import https = require('https');
import fs = require('fs');
import lodash = require('lodash');
import mongoose = require('mongoose');
import Schema = require('./database/schema/schema');
import Database = require('./database/database')
import apiRouter = require('./routes/api/index');
import router = require('./routes/index');

/*export enum Environment{
 development,
 production
 }*/

export interface ServerConfiguration {
    environment: string;
    port:number;
    server: string;
    isSSL: boolean;
    /*    requestType?:()=>string;*/
    staticPath?: string;
    httpRedirectPort?: number;
    applicationPath?: string;
    ssl?:{
        key:string;
        certificate:string;
        ca:string;
        keyFile:string;
        certFile:string;
        caFile: string;
    };
    socketIOEnabled: boolean;
    staticFilePath: string;
    cookie:
        {
            secret: string;
        };
    cors: {
        domains:string[];
    }
}

interface SSLOptions {
    key: Buffer;
    certificate: Buffer;
    ca: Buffer;
}

export interface Connections {
    application: express.Application;
    server: http.Server;
    secureServer: https.Server;
    connection: mongoose.Connection;

}
export class Server {
    private connection:mongoose.Connection;
    private configuration:ServerConfiguration;
    private rootPath:string;
    private environment:string;
    private server;
    //private httpServer;
    private app;

    constructor(configuration:ServerConfiguration, rootPath:string) {
        this.configuration = configuration;
        this.rootPath = rootPath;
        this.environment = process.env;
    }
    private allowCors(domains:string[]) {
        var allowAll = lodash.contains(domains, '*');
        // return CORS middleware bound to domains arg
        return function (req, res, next) {
            var origin = req.get('Origin');
            var optionsSent = false;
            var allowedDomain = false;
            if (origin !== undefined) {
                var ii;
                for (ii = 0; ii < domains.length; ii++) {
                    if (origin.indexOf(domains[ii]) > -1) {
                        allowedDomain = true;
                        break;
                    }
                }
            }
            if (allowAll || allowedDomain) {
                res.header('Access-Control-Allow-Origin', origin);
                res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
                // intercept OPTIONS method for preflight response
                if (req.method === 'OPTIONS') {
                    optionsSent = true;
                    res.send(200);
                }
            }
            if (!optionsSent) {
                next();
            }
        };
    }
    startup(configuration:Database.DatabaseConfiguration) {
        var deferred = Q.defer();
        this.connection = new Database.Database().createConnection(configuration);
        this.connection.on('connected', function () {
            console.log('Mongoose connected');
        });
        this.connection.on('open', ()=> {
            console.log('Mongoose default connection open');
            new Schema.Schema(this.connection).init();
            var expressApp = this.configureServer(this.configuration, this.connection);
            this.app = expressApp.application;
            this.server = this.configuration.isSSL ? expressApp.secureServer : expressApp.server;
            deferred.resolve(this);
        });
        this.connection.on('error', function (err) {
            deferred.reject(err);
            console.log('Mongoose default connection error: ' + err);
        });
        this.connection.on('disconnected', function () {
            console.log('Mongoose default connection disconnected');
        });
        return deferred.promise;
    }
    private configureServer(configuration:ServerConfiguration, connection:mongoose.Connection) {
        var app = express();
        var listener;
        if (configuration.isSSL) {
            var opts:SSLOptions = {
                key: fs.readFileSync(__dirname + configuration.ssl.keyFile),
                certificate: fs.readFileSync(__dirname + configuration.ssl.certFile),
                ca: null
            };
            if (configuration.ssl.ca !== undefined && configuration.ssl.ca.length > 0) {
                opts.ca = fs.readFileSync(__dirname + configuration.ssl.caFile);
            }
            this.server = https.createServer(opts, app);
        } else {
            //need to use http for socket.io
            this.server = http.createServer(app);
        }
        //var staticFilePath = __dirname + '\\' + configuration.staticFilePath;
        app.use(morgan('combined'));
        app.use(compression());

        app.use(express.static(__dirname + '/app'));
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());
        //app.use(methodOverride());
        app.use(cookieParser(configuration.cookie.secret));
        // allow cors
        if (configuration.cors && configuration.cors.domains) {
            app.use(this.allowCors(configuration.cors.domains));
        }
        // set app settings variables
        app.set('environment', configuration.environment);
        // load api
        var ret:Connections = {
            application: app,
            server: this.server,
            secureServer: this.server,
            connection: connection
        };

        var api = new apiRouter.ApiRouter(configuration, ret);
        app.use(api.prepareRoutes());
        var mr = new router.MainRouter().start();
        app.use('/', mr);
        if (this.environment.toString() === 'development') {
            app.use(errorHandler({dumpExceptions: true, showStack: true}));
        } else {
            app.use(errorHandler());
        }
        this.listen(this.defaultListenerCallback);
        return ret;
    }
    private defaultListenerCallback(configuration:ServerConfiguration) {
        var loc1 = 'http' + (configuration.isSSL ? 's' : '') + '://' + configuration.server + ':' + configuration.port.toString() + '/';
        console.log('Express server listening at ' + loc1 + ' in ' + configuration.environment + ' mode');
    }
    listen(callback:any) {
        var port = process.env.PORT || this.configuration.port;

        callback = callback || this.defaultListenerCallback;

        this.server.listen(port, () => {
            callback(this.configuration);
        });
    }
}


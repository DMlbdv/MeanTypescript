/**
 * Created by Michael on 6/24/2015.
 */
/// <reference path="../../../types/node.d.ts" />
/// <reference path="../../../types/express.d.ts" />

import express = require('express');
import Server = require('../../server')
import path = require('path');
import bodyParser = require('body-parser');
import Q = require('q');
import schema = require('../../database/schema/schema');

export class ApiRouter {
    private configuration:Server.ServerConfiguration;
    private connections:Server.Connections;
    private Schema;
    private Activity;
    private Project;
    private User;
    private Technician;
    private app;
    private router;
    private db;
    private server;

    constructor(configuration:Server.ServerConfiguration, connections:Server.Connections) {
        this.configuration = configuration;
        this.connections = connections;
        this.prepareSchema(connections);
    }
    private prepareSchema(connections) {
        this.Schema = new schema.Schema((connections.connection));
        this.Schema.init();
        this.Activity = this.Schema.models.activity;
        this.Technician = this.Schema.models.technician;
        this.User = this.Schema.models.user;
        this.Project = this.Schema.models.project;
    }
//TODO this is not unit testable need to break the routes into separate files and import via require
    prepareRoutes() {
        this.app = express();
        this.router = express.Router();
        this.router.use(bodyParser.urlencoded({extended: true}));
        this.db = this.connections.connection;
        this.server = this.configuration.isSSL ? this.connections.secureServer : this.connections.server;
        this.app.use('/api', this.router);
        this.router.route('/activities').get((req, res) => {
            this.Activity.find(function (err, activities) {
                if (err) {
                    return res.send(err);
                }
                res.json(activities);
            });
        });
        this.router.route('/activities').post((req, res) => {
            var model = new this.Activity({
                technician: req.body.technician.fullName,
                hoursWorked: req.body.hoursWorked,
                workDate: req.body.workDate,
                projectWorked: req.body.ordersWorked,
                workPerformed: req.body.workPerformed,
                materialsUsed: req.body.materialsUsed
            });
            model.save(function (err) {
                console.log(err);
                if (err) {
                    return res.send(err);
                } else {
                    res.sendStatus(201);
                }
            });
        });

        this.router.route('/validOrderNumber').post((req, res) => {
            this.Project.findOne({projectNumber: req.body.orderNumber})
                .then(function (result) {
                    if (result) {
                        res.sendStatus(200);
                    } else {
                        res.sendStatus(404);
                    }
                });
        });
        this.router.route('/technicians').get((req, res) => {
            this.Technician.find({isActive: true}, {employeeId: 1, firstName: 1, lastName: 1, fullName: 1, _id: 0})
                .then(function (technicians) {
                    res.json(technicians);
                })
                .catch(function (err) {
                    console.log(err);
                });
        });
        this.router.route('*').all((req, res) => {
            res.sendStatus(404);
        });
        return this.app;
    }
}

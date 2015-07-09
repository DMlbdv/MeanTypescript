/// <reference path="../../../types/node.d.ts" />
/// <reference path="../../../types/mongoose.d.ts" />
/**
 * Created by Michael on 6/22/2015.
 */
import mongoose = require('mongoose');
import users =  require('../../models/users');
import activities = require('../../models/activities');
import projects = require('../../models/projects');
import technicians =require('../../models/technicians');

export class Schema {
    public models;

    constructor(private connection:mongoose.Connection) {
        this.connection = connection;
    }
    init() {

        this.models = {
            activity: this.connection.model('Activity',activities.ActivityModel.schema),
            project: this.connection.model('Project', projects.ProjectModel.schema),
            technician: this.connection.model('Technician', technicians.TechnicianModel.schema),
            user: this.connection.model('User', users.UserModel.schema)
        }
    }
}


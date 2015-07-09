/**
 * Created by Michael on 6/23/2015.
 */
/// <reference path="../../types/mongoose.d.ts" />
import mongoose = require('mongoose');
import standards = require('./standards');
// create a schema
var projectSchema:mongoose.Schema = new mongoose.Schema({
    projectNumber: {type: String, required: true, unique: true}
}, {collection:'projects'});

export interface IProject extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    projectNumber:String;
}
projectSchema.plugin(standards.standards);

export  var ProjectModel = mongoose.model<IProject>('Project', projectSchema);
/**
 * Created by Michael on 6/23/2015.
 */
/// <reference path="../../types/mongoose.d.ts" />

import mongoose = require('mongoose');
import standards = require('./standards');
var activitySchema:mongoose.Schema = new mongoose.Schema({
        workDate: {type: Date, required: true},
        projectWorked: {type: String, required: true},
        workPerformed: {type: String, required: true},
        technician: {type: String, required: true},
        materialsUsed: String,
        hoursWorked: {type: Number, required: true}
    }, {collection:'activities'});


export interface IActivity extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    workDate: Date;
    projectWorked: String;
    workPerformed: String;
    technician: String;
    materialsUsed: String;
    hoursWorked: Number
}
activitySchema.plugin(standards.standards);
export var ActivityModel = mongoose.model<IActivity>('Activity', activitySchema);
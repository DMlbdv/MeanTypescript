/**
 * Created by Michael on 6/22/2015.
 */
/// <reference path="../../types/mongoose.d.ts" />
import mongoose = require('mongoose');
import standards = require('./standards');
var schemaOptions = {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    },
    collection:'technicians'
};

// create a schema
var technicianSchema:mongoose.Schema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {type: String, required: true, unique: true},
    employeeId: {type:Number, unique:true, required: true}
}, schemaOptions);

export interface ITechnician extends mongoose.Document{
    _id: mongoose.Types.ObjectId;
    firstName: string;
    lastName:string;
    email: string;
    employeeId: Number;
    fullName:()=> string;
}

technicianSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName;
});

technicianSchema.plugin(standards.standards);

export var TechnicianModel = mongoose.model<ITechnician>('Technician', technicianSchema);
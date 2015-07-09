/**
 * Created by Michael on 6/22/2015.
 */
/// <reference path="../../types/mongoose.d.ts" />
import mongoose = require('mongoose');
import standards = require('./standards');

// create a schema
var userSchema:mongoose.Schema = new mongoose.Schema({

    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    isAdmin: {type:Boolean, default: false}
});

 export interface IUser extends mongoose.Document{
     _id: mongoose.Types.ObjectId;
     firstName: String;
     lastName: String;
     email:String;
     username:String;
     password: String;
     isAdmin: boolean;

 }
userSchema.plugin(standards.standards);

export var UserModel = mongoose.model<IUser>('User', userSchema);
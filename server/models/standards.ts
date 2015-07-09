/**
 * Created by Michael on 6/22/2015.
 */
/// <reference path="../../types/mongoose.d.ts" />
import mongoose = require('mongoose');
export function standards(schema: mongoose.Schema, options?:Object) {
    schema.add({
        createdOnUtc: Date,
        isActive: {type: Boolean, default: true},
        lastModifiedOnUtc: Date,
        createdByUserId: String,
        lastModifiedByUserId: String
    });

    schema.pre('save', function (next, req) {
        var user = req.session ? req.session.user_id ? req.session.user_id : 'Me' : 'Me';
        if (this.isNew) {
            this.createdOnUtc = new Date;
            this.createdByUserId = user;

        }
        this.lastModifiedOnUtc = new Date;
        this.lastModifiedByUserId = user;
        next();
    });
}
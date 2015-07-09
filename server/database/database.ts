/// <reference path="../../types/node.d.ts" />
/// <reference path="../../types/mongoose.d.ts" />


import mongoose = require('mongoose');

/**
 Initialize database connection using mongoose-native
 @method exports
 @return {Database} Database constructor
 **/
export interface DatabaseConfiguration {
    userName: string;
    password: string;
    databasePortNumber:number;
    databaseUrl: string;
    databaseName: string;
    isSSL: boolean;
}
export class Database
{
    constructor(){
    }
    createConnection(configuration: DatabaseConfiguration){
        var tval = mongoose.createConnection('mongodb://localhost:27017/schedulingApp');
        //console.log('tval ' + tval)
        return tval;
    }
}

process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});




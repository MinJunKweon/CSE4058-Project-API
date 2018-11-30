var mysql = require('mysql');
var dbConfig = require("../config/dbConfig");

var pool = mysql.createPool(dbConfig);

exports.connection = function (callback) {
    pool.getConnection(function (err, connection) {
        callback(err, connection);
        connection.release()
    });
};
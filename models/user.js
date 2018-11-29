var db = require('../controllers/db');
var crypto = require('crypto');

exports.findOne = function (userId, next) {
    db.connection(function (err, connection) {
        if (err) {
            err['status'] = 500;
            return next(err, null);
        }
        connection.query('SELECT * FROM `USER` WHERE `user_id` = ?',
            [userId],
        function (err, results, fields) {
            if (err) {
                err['status'] = 500;
                return next(err, null);
            }
            if (!results.length) {
                err = { 'status' : 200, 'message' : 'no user'}
                return next(err, null);
            }
            return next(null, results.length ? results[0] : null);
        });
    });
}

exports.signIn = function (body, next) {
    if (body && body['password']) {
        var sha256 = crypto.createHash('sha256');
        sha256.update(body['password']);
        body['password'] = sha256.digest('hex');
    } else {
        return next({ 'status' : 200, 'message' : 'empty password' }, null);
    }
    db.connection(function (err, connection) {
        if (err) {
            err['status'] = 500;
            return next(err, null);
        }
        connection.query('SELECT * FROM `USER` WHERE `email` = ? AND `password` = ?',
            [body['email'], body['password']],
        function (err, results, fields) {
            if (err) {
                err['status'] = 500;
                return next(err, null);
            }
            if (!results.length) {
                err = { 'status' : '200', 'message' : 'no user' };
                return next(err, null);
            }
            return next(null, results[0]);
        });
    });
}

exports.create = function (body, next) {
    if (body && body['password']) {
        var sha256 = crypto.createHash('sha256');
        sha256.update(body['password']);
        body['password'] = sha256.digest('hex');
    } else {
        var err = { 'status' : 200, 'message' : 'empty password' };
        return next(err, null);
    }

    db.connection(function (err, connection) {
        if (err) {
            err['status'] = 500;
            return next(err, null);
        }
        connection.query('INSERT INTO `USER` SET ?',
            body,
        function (err, results, fields) {
            if (err || !results || !results.length) {
                err['status'] = 500;
                return next(err, null);
            }
            return next(null, results ? results.insertId : null);
        });
    });
}

exports.updatePassword = function (userId, password, next) {
    if (!userId) {
        return next({ 'code' : 201, 'message' : 'no user id' });
    }

    if (!password) {
        return next({ 'code' : 201, 'message' : 'no password' });
    } else {
        var sha256 = crypto.createHash('sha256');
        sha256.update(password);
        password = sha256.digest('hex');
    }

    db.connection(function (err, connection) {
        if (err) {
            err['status'] = 500;
            return next(err, null);
        }
        connection.query('UPDATE `USER` SET `password` = ? WHERE `user_id` = ?',
            [password, userId],
        function (err, results, fields) {
            if (err) {
                err['status'] = 500;
                return next(err);
            }
            return next(null);
        });
    });
};
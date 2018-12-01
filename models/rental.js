var db = require('../controllers/db');

exports.findOne = function (rentalStateId, next) {
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err, null);
        }
        connection.query('SELECT * FROM `RENTAL_STATE` WHERE `rental_state_id` = ?',
            [rentalStateId],
        function (err, results, fields) {
            if (err) {
                err['code'] = 500;
                return next(err, null);
            }
            if (!results.length) {
                err = { 'code' : 600, 'message' : 'no rental state'}
                return next(err, null);
            }
            return next(null, results[0]);
        });
    });
}

exports.allRentals = function (userId, next) {
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err, null);
        }
        connection.query('SELECT * FROM `RENTAL_STATE` WHERE `user_id` = ?',
            [userId],
            function (err, results, fields) {
                if (err) {
                    err['code'] = 500;
                    return next(err, null);
                }
                return next(null, results);
            });
    });
}

exports.postRental = function (userId, rentalShopId, itemId, next) {
    var receivedCode = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    var returnCode = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err);
        }
        connection.query('INSERT INTO `RENTAL_STATE`\
        (`user_id`, `rental_shop_id`, `item_id`, `received_code`, `return_code`) \
        VALUES(?, ?, ?, ?, ?)',
            [userId, rentalShopId, itemId, receivedCode, returnCode],
            function (err, results, fields) {
                if (err) {
                    err['code'] = 500;
                    return next(err);
                }
                return next(null);
            });
    });
}
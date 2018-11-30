var db = require('../controllers/db');

exports.findCoupon = function (couponId, next) {
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err, null);
        }
        connection.query('SELECT * FROM `COUPON` WHERE `coupon_id` = ?',
            [couponId],
        function (err, results, fields) {
            if (err) {
                err['code'] = 500;
                return next(err, null);
            }
            if (!results.length) {
                err = { 'code' : 602, 'message' : 'no coupon'}
                return next(err, null);
            }
            return next(null, results[0]);
        });
    });
}

exports.allCoupons = function (next) {
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err, null);
        }
        connection.query('SELECT * FROM `COUPON`',
            function (err, results, fields) {
                if (err) {
                    err['code'] = 500;
                    return next(err, null);
                }
                return next(null, results);
            });
    });
}

exports.userCoupons = function(userId, next) {
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err, null);
        }
        connection.query('SELECT * FROM `CUSTOMER_COUPON` WHERE `user_id` = ?',
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

exports.userCouponsAvailable = function(userId, next) {
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err, null);
        }
        connection.query('SELECT * FROM `CUSTOMER_COUPON` WHERE `user_id` = ? AND `is_using` = 0 AND `is_deleted` = 0',
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

exports.purchaseCoupon = function(userId, couponId, next) {
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err);
        }
        connection.query('INSERT INTO `CUSTOMER_COUPON`(`user_id`, `coupon_id`) VALUES(?, ?)',
            [userId, couponId],
            function (err, results, fields) {
                if (err) {
                    err['code'] = 500;
                    return next(err);
                }
                if (!results || !results.insertId) {
                    return next({ 'code' : 500, 'message' : 'insert coupon error' });
                }
                return next(null);
            });
    });
}
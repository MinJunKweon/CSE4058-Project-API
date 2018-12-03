var db = require('../controllers/db');

exports.allShops = function (next) {
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err, null);
        }
        connection.query('SELECT * FROM `RENTAL_SHOP`',
        function (err, results, fields) {
            if (err) {
                err['code'] = 500;
                return next(err, null);
            }
            return next(null, results);
        });
    });
}

exports.changeState = function (rentalShopId, isAvailable, reason, next) {
    isAvailable = isAvailable ? isAvailable : 0;
    reason = reason ? isAvailable == 0 ? reason : null : null;
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err);
        }
        connection.query('UPDATE `RENTAL_SHOP` SET `is_available` = ?, `reason` = ? WHERE `rental_shop_id` = ?',
        [isAvailable, reason, rentalShopId],
        function (err, results, fields) {
            if (err) {
                err['code'] = 500;
                return next(err);
            }
            return next(null);
        })
    });
}
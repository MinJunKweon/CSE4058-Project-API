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
            var newShops = [];
            results.forEach(e => {
                e['item_amount'] = [ 0, e['item1_amt'], e['item2_amt'], e['item3_amt']];
                newShops = newShops.concat([e]);
            });
            return next(null, newShops);
        });
    });
}

exports.changeState = function (rentalShopId, isAvailable, item1Amt, item2Amt, item3Amt, reason, next) {
    isAvailable = isAvailable ? isAvailable : 0;
    reason = reason ? isAvailable == 0 ? reason : null : null;
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err);
        }
        connection.query('UPDATE `RENTAL_SHOP` SET `is_available` = ?, `reason` = ?, `item1_amt` = ?, `item2_amt` = ?, `item3_amt` = ? WHERE `rental_shop_id` = ?',
        [isAvailable, reason, item1Amt, item2Amt, item3Amt, rentalShopId],
        function (err, results, fields) {
            if (err) {
                err['code'] = 500;
                return next(err);
            }
            return next(null);
        })
    });
}
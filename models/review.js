var db = require('../controllers/db');

exports.allReviews = function (rentalShopId, itemId, next) {
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err);
        }
        connection.query('SELECT * FROM `REVIEW` WHERE `rental_shop_id` = ? AND `item_id` = ?',
        [rentalShopId, itemId],
        function (err, results) {
            if (err) {
                err['code'] = 500;
                return next(err);
            }
            return next(null, results);
        });
    });
};

exports.postReview = function (body, next) {
    var userId = body['user_id']
    var rentalStateId = body['rental_state_id'];
    var rentalShopId = body['rental_shop_id'];
    var itemId = body['item_id'];
    var title = body['title'];
    var description = body['description'];
    var rate = body['rate'];
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err);
        }
        connection.query('INSERT INTO `REVIEW`(`author_id`, `rental_shop_id`, `item_id`, `title`, `description`, `rate`) VALUES(?, ?, ?, ?, ?, ?)',
        [userId, rentalShopId, itemId, title, description, rate],
        function (err, results) {
            if (err) {
                err['code'] = 500;
                return next(err);
            }
            connection.query('UPDATE `RENTAL_STATE` SET `is_reviewed` = 1 WHERE `rental_state_id` = ?', [rentalStateId], null);
            return next(null);
        });
    });
}
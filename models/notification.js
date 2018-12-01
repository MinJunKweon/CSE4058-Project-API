var db = require('../controllers/db');

exports.allNotification = function (userId, next) {
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err, null);
        }
        connection.query('SELECT * FROM `NOTIFICATION` WHERE `user_id` = ? ORDER BY `created_at` DESC',
        [userId],
        function (err, results, fields) {
            if (err) {
                err['code'] = 500;
                return next(err, null);
            }
            connection.query('UPDATE `NOTIFICATION` SET `unread` = 0 WHERE `user_id` = ?',
                [userId],
                function (err) {
                    return next(null, results);
                });
        });
    });
}

exports.postNotification = function (userId, title, description, next) {
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err);
        }
        connection.query('INSERT INTO `NOTIFICATION`(`user_id`, `title`, `description`) VALUES (?, ?, ?)',
            [userId, title, description],
            function (err, results, fields) {
                if (err) {
                    err['code'] = 500;
                    return next(err);
                }
                return next(null);
            });
    });
}
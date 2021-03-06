var db = require('../controllers/db');

var notification = require('./notification');

var rentalStatify = function (result) {
    return {
        'item' : {
            'item_id' : result['item_id'],
            'item_name' : result['item_name']
        },
        'rental_shop' : {
            'rental_shop_id' : result['rental_shop_id'],
            'rental_shop_name' : result['rental_shop_name'],
            'rental_shop_address' : result['rental_shop_address'],
            'latitude' : result['latitude'],
            'longitude' : result['longitude'],
            'is_available' : result['is_available']
        },
        'coupon_seq' : result['coupon_seq'],
        'rental_state_id' : result['rental_state_id'],
        'state' : result['state'],
        'start_date' : result['start_date'],
        'end_date' : result['end_date'],
        'received_code' : result['received_code'],
        'return_code' : result['return_code'],
        'is_expired' : result['is_expired'],
        'is_reviewed' : result['is_reviewed'],
        'created_at' : result['created_at']
    };
}

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

exports.history = function(userId, next) {
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err, null)
        }
        connection.query('SELECT * FROM `RENTAL_STATE`, `RENTAL_SHOP`, `ITEM`\
        WHERE `user_id` = ? AND `state` = 2\
        AND `RENTAL_SHOP`.`rental_shop_id` = `RENTAL_STATE`.`rental_shop_id`\
        AND `ITEM`.`item_id` = `RENTAL_STATE`.`item_id`\
        ORDER BY `rental_state_id`',
            [userId],
            function (err, results, fields) {
                if (err) {
                    err['code'] = 500;
                    return next(err, null);
                }
                if (!results.length) {
                    return next(null, []);
                }
                var newResults = []
                for (idx in results) {
                    var result = results[idx];
                    var newResult = rentalStatify(result);
                    newResults = newResults.concat([newResult]);
                }
                return next(null, newResults);
            });
    })
}

exports.postRental = function (userId, rentalShop, item, couponSeq, next) {
    var receivedCode = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    var returnCode = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

    var rentalShopId = rentalShop['rental_shop_id'];
    var itemId = item['item_id'];

    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err);
        }
        var itemAttr = ['item', itemId, '_amt'].join('');
        connection.query('SELECT * FROM `RENTAL_SHOP` WHERE `rental_shop_id` = ?',
        [rentalShopId],
        function (err, results, fields) {
            if (err) {
                err['code'] = 500;
                return next(err);
            }
            if (!results.length || parseInt(results[0][itemAttr]) < 1) {
                return next({
                    'code' : 606,
                    'message' : 'no items'
                });
            }
            connection.query('UPDATE `CUSTOMER_COUPON` SET `is_using` = 1 WHERE `coupon_seq` = ? AND `is_using` = 0',
            [couponSeq],
            function (err, results, fields) {
                if (err) {
                    err['code'] = 500;
                    return next(err);
                }
                connection.query('INSERT INTO `RENTAL_STATE`\
                (`user_id`, `rental_shop_id`, `item_id`, `coupon_seq`, `received_code`, `return_code`) \
                VALUES(?, ?, ?, ?, ?, ?)',
                [userId, rentalShopId, itemId, couponSeq, receivedCode, returnCode],
                function (err, results, fields) {
                    if (err) {
                        err['code'] = 500;
                        return next(err);
                    }
                    var title = ['[', item['item_name'], '] 대여 신청되었습니다.'].join('')
                    var description = ['[', item['item_name'], '] 물품을 [',
                        rentalShop['rental_shop_name'], '] 대여소 (', rentalShop['rental_shop_address'], 
                        ') 에서 수령하실 수 있습니다.'].join('');
                    notification.postNotification(userId, title, description, function (err) {
                        return next(null);
                    });
                });
            });
        });
    });
}

exports.currentRentals = function(userId, next) {
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err, null);
        }
        connection.query('SELECT * FROM `RENTAL_STATE`, `RENTAL_SHOP`, `ITEM`\
        WHERE `user_id` = ? AND `state` <> 2\
        AND `RENTAL_SHOP`.`rental_shop_id` = `RENTAL_STATE`.`rental_shop_id`\
        AND `ITEM`.`item_id` = `RENTAL_STATE`.`item_id`\
        ORDER BY `rental_state_id`',
            [userId],
            function (err, results, fields) {
                if (err) {
                    err['code'] = 500;
                    return next(err, null);
                }
                if (!results.length) {
                    return next(null, []);
                }
                var newResults = []
                for (idx in results) {
                    var result = results[idx];
                    var newResult = rentalStatify(result);
                    newResults = newResults.concat([newResult]);
                }
                return next(null, newResults);
            });
    });
};

exports.receive = function (receivedCode, next) {
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err);
        }
        connection.query('UPDATE `RENTAL_STATE` SET `state` = 1 WHERE `received_code` = ?',
            [receivedCode],
            function (err, updates, fields) {
                if (err) {
                    err['code'] = 500;
                    return next(err);
                }
                connection.query('SELECT * FROM `RENTAL_STATE`, `ITEM`, `RENTAL_SHOP` WHERE `received_code` = ? AND `ITEM`.`item_id` = `RENTAL_STATE`.`item_id` AND `RENTAL_SHOP`.`rental_shop_id` = `RENTAL_STATE`.`rental_shop_id`',
                [receivedCode],
                function (err, results, fields) {
                    if (err) {
                        err['code'] = 500;
                        return next(err);
                    }
                    if (results.length == 0) {
                        return next({
                            'code' : 404,
                            'message' : 'rental not found'
                        });
                    }
                    var result = results[0];
                    var itemAttr = ['item',result['item_id'],'_amt'].join('');
                    connection.query('UPDATE `RENTAL_SHOP` SET ? WHERE `rental_shop_id` = ?',
                    [{ [itemAttr] : result[itemAttr] - 1}, result['rental_shop_id']]);

                    connection.query('UPDATE `RENTAL_STATE` SET `received_code` = NULL WHERE `received_code` = ?', [receivedCode]);

                    var title = ['[', result['item_name'], '] 수령하셨습니다.'].join('')
                    var description = ['[', result['item_name'], '] 물품을 [',
                        result['rental_shop_name'], '] 대여소 (', result['rental_shop_address'], 
                        ') 에서 수령하셨습니다.'].join('');
                    notification.postNotification(result['user_id'], title, description, function (err) {
                        return next(null);
                    });
                })
            });
    });
}

exports.return = function (returnCode, next) {
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err);
        }
        connection.query('UPDATE `RENTAL_STATE` SET `state` = 2, `end_date` = CURRENT_TIMESTAMP WHERE `return_code` = ?',
            [returnCode],
            function (err, updates, fields) {
                if (err) {
                    err['code'] = 500;
                    return next(err);
                }
                connection.query('SELECT * FROM `RENTAL_STATE`, `ITEM`, `RENTAL_SHOP` WHERE `return_code` = ? AND `ITEM`.`item_id` = `RENTAL_STATE`.`item_id` AND `RENTAL_SHOP`.`rental_shop_id` = `RENTAL_STATE`.`rental_shop_id`',
                [returnCode],
                function (err, results, fields) {
                    if (err) {
                        err['code'] = 500;
                        return next(err);
                    }
                    if (results.length == 0) {
                        return next({
                            'code' : 404,
                            'message' : 'rental not found'
                        });
                    }
                    var result = results[0];
                    var itemAttr = ['item',result['item_id'],'_amt'].join('');
                    connection.query('UPDATE `RENTAL_SHOP` SET ? WHERE `rental_shop_id` = ?',
                    [{ [itemAttr] : result[itemAttr] + 1}, result['rental_shop_id']]);
                    connection.query('UPDATE `RENTAL_STATE` SET `return_code` = NULL WHERE `return_code` = ?', [returnCode]);

                    var title = ['[', result['item_name'], '] 반납하셨습니다.'].join('')
                    var description = ['[', result['item_name'], '] 물품을 [',
                    result['rental_shop_name'], '] 대여소 (', result['rental_shop_address'], 
                        ') 에서 반납하셨습니다.'].join('');
                    notification.postNotification(result['user_id'], title, description, function (err) {
                        return next(null);
                    });
                })
            });
    });
}

exports.additionalPayment = function (userId, next) {
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err);
        }
        connection.query('UPDATE `RENTAL_STATE` SET `is_additional_payment` = 1 WHERE `user_id` = ? AND `state` = 2',
        [userId], function (err, results, fields) {
            if (err) {
                err['code'] = 500;
                return next(err);
            }
            return next(null);
        });
    });
}
var express = require('express');
var router = express.Router();
var rental = require('../models/rental');
var auth = require('../auth');

/* all rental states */
router.post('/create', auth, function (req, res, next) {
    // var userId = req.session.user['user_id'];
    var userId = 17;
    var rentalShop = req.body['rental_shop'];
    var item = req.body['item'];
    rental.postRental(userId, rentalShop['rental_shop_id'], item['item_id'], function (err) {
        if (err) {
            console.log(err);
            return res.status(err['code']).send(err)
        }
        return res.json({
            'code': 200,
            'message' : 'succeed to create rental state'
        });
    });
});

module.exports = router;
var express = require('express');
var router = express.Router();
var rental = require('../models/rental');
var auth = require('../auth');

/* all rental states */
router.post('/create', auth, function (req, res, next) {
    var couponSeq = req.body['coupon_seq'];
    var userId = req.session.user['user_id'];
    var rentalShop = req.body['rental_shop'];
    var item = req.body['item'];
    rental.postRental(userId, rentalShop, item, couponSeq, function (err) {
        if (err) {
            return res.status(err['code']).send(err);
        }
        return res.json({
            'code': 200,
            'message' : 'succeed to create rental state'
        });
    });
});

router.get('/current', auth, function (req, res, next) {
    var userId = req.session.user['user_id'];
    rental.currentRentals(userId, function (err, rentals) {
        if (err) {
            return res.status(err['code']).send(err);
        }
        return res.json({
            'code' : 200,
            'message' : 'succeed to get all current rentals',
            'data' : rentals
        });
    });
});

module.exports = router;
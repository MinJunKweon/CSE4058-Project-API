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

router.get('/history', auth, function (req, res, next) {
    var userId = req.session.user['user_id'];
    rental.history(userId, function (err, rentals) {
        if (err) {
            return res.status(err['code']).send(err);
        }
        return res.json({
            'code' : 200,
            'message' : 'succeed to get all rental state history',
            'data' : rentals
        });
    });
});

/* 물품 수령 */
router.get('/receive/:rental_state_id', auth, function (req, res, next) {
    var userId = req.session.user['user_id'];
    var rentalStateId = req.params['rental_state_id'];
    rental.receive(userId, rentalStateId, function (err) {
        if (err) {
            return res.status(err['code']).send(err);
        }
        return res.json({
            'code' : 200,
            'message' : 'succeed to receive item'
        });
    });
});

/* 물품 반납 */
router.get('/return/:rental_state_id', auth, function (req, res, next) {
    var userId = req.session.user['user_id'];
    var rentalStateId = req.params['rental_state_id'];
    rental.return(userId, rentalStateId, function (err) {
        if (err) {
            return res.status(err['code']).send(err);
        }
        return res.json({
            'code' : 200,
            'message' : 'succeed to return item'
        });
    });
});

module.exports = router;
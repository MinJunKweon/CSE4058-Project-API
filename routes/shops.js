var express = require('express');
var router = express.Router();
var shop = require('../models/shop');
var auth = require('../auth');

/* all rental shops */
router.get('/', auth, function (req, res, next) {
    shop.allShops(function (err, shops) {
        if (err) {
            return res.status(err['code']).send(err)
        }
        return res.json({
            'code': 200,
            'message' : 'all rental shops',
            'data' : shops
        });
    });
});

router.post('/change-state', auth, function (req, res, next) {
    var isAvailable = req.body['is_available'];
    var reason = req.body['reason'];
    var rentalShopId = req.body['rental_shop_id'];
    shop.changeState(rentalShopId, isAvailable, reason, function (err){
        if (err) {
            console.log(err);
            return res.status(err['code']).send(err);
        }
        return res.json({
            'code' : 200,
            'message' : 'succeed to change state'
        });
    });
});

module.exports = router;
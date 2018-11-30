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

module.exports = router;
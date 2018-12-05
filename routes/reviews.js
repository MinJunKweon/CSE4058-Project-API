var express = require('express');
var router = express.Router();
var review = require('../models/review');
var auth = require('../auth');

router.get('/', auth, function (req, res, next) {
    var rentalShopId = req.query['rental_shop_id'];
    var itemId = req.query['item_id'];

    review.allReviews(rentalShopId, itemId, function (err, reviews) {
        if (err) {
            console.log(err);
            return res.status(err['code']).send(err);
        }
        return res.json({
            'code' : 200,
            'message' : 'succeed to get all reviews',
            'data' : reviews
        });
    });
});

router.post('/create', auth, function (req, res, next) {
    req.body['user_id'] = req.session.user['user_id'];

    review.postReview(req.body, function (err) {
        if (err)  {
            console.log(err);
            return res.status(err['code']).send(err);
        }
        return res.json({
            'code' : 200,
            'message' : 'succeed to post review'
        });
    });
});

module.exports = router;
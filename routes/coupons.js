var express = require('express');
var router = express.Router();
var db = require('../controllers/db');
var coupon = require('../models/coupon');
var auth = require('../auth');

/* 모든 쿠폰 목록 가져오기 */
router.get('/all', auth, function (req, res, next) {
    coupon.allCoupons(function (err, coupons) {
        if (err) {
            console.log(err);
            return res.status(err['code']).send(err);
        }
        return res.json({ 'code' : 200, 'message' : 'succeed to get all coupon list', data : coupons });
    });
});

/* 사용자가 가진 쿠폰 목록 불러오기 */
router.get('/', auth, function (req, res, next) {
    coupon.userCoupons(req.session.user['user_id'], function (err, coupons) {
        if (err) {
            return res.status(err['code']).send(err);
        }
        return res.json({ 'code' : 200, 'message' : 'succeed to get user coupons', 'data' : coupons });
    });
});

/* 사용자의 사용가능한 쿠폰 목록 불러오기 */
router.get('/available', auth, function (req, res, next) {
    coupon.userCouponsAvailable(req.session.user['user_id'], function (err, coupons) {
        if (err) {
            return res.status(err['code']).send(err);
        }
        return res.json({ 'code' : 200, 'message' : 'succeed to get user coupons available', 'data' : coupons });
    });
});

/* 쿠폰 구매 */
router.post('/', auth, function (req, res, next) {
    coupon.purchaseCoupon(req.session.user['user_id'], req.body['coupon_id'], function (err, coupon) {
        if (err) {
            return res.status(err['code']).send(err);
        }
        return res.json({ 'code' : 200, 'message' : 'succeed to insert user coupon', 'data' : coupon });
    });
});

module.exports = router;
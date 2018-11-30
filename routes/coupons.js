var express = require('express');
var router = express.Router();
var db = require('../controllers/db');
var coupon = require('../models/coupon');
var auth = require('../auth');

/* coupon 목록 불러오기 */
router.get('/', auth, function (req, res, next) {
    coupon.allCoupons(function (err, coupons) {
        if (err) {
            return res.status(err['code']).send(err);
        }
        return res.json({ 'code' : 200, 'message' : 'succeed to get coupons', 'data' : coupons });
    });
});

/* 사용자가 가진 쿠폰 목록 불러오기 */
router.get('/:user_id', auth, function (req, res, next) {
    coupon.userCoupons(req.params['user_id'], function (err, coupons) {
        if (err) {
            return res.status(err['code']).send(err);
        }
        return res.json({ 'code' : 200, 'message' : 'succeed to get user coupons', 'data' : coupons });
    });
});

/* 사용자의 사용가능한 쿠폰 목록 불러오기 */
router.get('/:user_id/available', auth, function (req, res, next) {
    coupon.userCouponsAvailable(req.params['user_id'], function (err, coupons) {
        if (err) {
            return res.status(err['code']).send(err);
        }
        return res.json({ 'code' : 200, 'message' : 'succeed to get user coupons available', 'data' : coupons });
    });
});

/* 쿠폰 구매 */
router.post('/:user_id', auth, function (req, res, next) {
    coupon.purchaseCoupon(req.params['user_id'], req.body['coupon_id'], function (err) {
        if (err) {
            return res.send(err);
        }
        return res.json({ 'code' : 200, 'message' : 'succeed to insert user coupon' });
    })
});

module.exports = router;
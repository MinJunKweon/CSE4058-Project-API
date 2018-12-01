var express = require('express');
var router = express.Router();
var notification = require('../models/notification');
var auth = require('../auth');

/* all notifications */
router.get('/', auth, function (req, res, next) {
    var userId = req.session.user['user_id'];
    notification.allNotification(userId, function (err, notifications) {
        if (err) {
            console.log(err);
            return res.status(err['code']).send(err);
        }
        return res.json({
            'code' : 200,
            'message' : 'succeed to get all notifications',
            'data' : notifications
        });
    });
});

module.exports = router;
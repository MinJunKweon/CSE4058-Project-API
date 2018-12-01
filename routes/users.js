var express = require('express');
var router = express.Router();
var db = require('../controllers/db');
var user = require('../models/user');
var auth = require('../auth');

/* sign in */
router.post('/sign-in', function(req, res, next) {
  user.signIn(req.body, function (err, user) {
    if (err) {
      return res.status(err['code']).send(err);
    }
    req.session.user = user;
    return res.json({ 'code' : 200, 'message' : 'succeed to sign in', 'data' : user });
  });
});

/* sign up */
router.post('/sign-up', function(req, res, next) {
  req.body['user_type'] = 0;

  user.create(req.body, function (err, userId) {
    if (err) {
      return res.status(err['code']).send(err);
    }
    user.findOne(userId, function (err, user) {
      if (err) {
        return res.status(err['code']).send(err);
      }
      req.session.user = user;
      return res.json({ 'code' : 200, 'message' : 'succeed to sign up', 'data' : user });
    });
  });
});

/* sign out */
router.get('/sign-out', auth, function (req, res, next) {
  req.session.destroy(function (err) {
    if (err) {
      return res.status(err['code']).send(err);
    }
    return res.json({ 'code' : 200, 'message' : 'succeed to sign out' });
  });
});

/* change password */
router.post('/change-password', auth, function (req, res, next) {
  user.updatePassword(req.session.user['user_id'], req.body['password'], function (err) {
    if (err) {
      return res.status(err['code']).send(err);
    }
    return res.json({ 'code' : 200, 'message' : 'succeed to change password' });
  });
});

/* FOR DEBUG : session checking */
router.get('/', auth, function (req, res, next) {
  return res.send(req.session);
});

module.exports = router;

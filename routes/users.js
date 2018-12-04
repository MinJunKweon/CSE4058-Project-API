var express = require('express');
var router = express.Router();
var db = require('../controllers/db');
var user = require('../models/user');
var auth = require('../auth');
var util = require('util');

var smsConfig = require('../config/smsConfig');
var https = require("https");
var credential = 'Basic '+new Buffer(smsConfig.APPID+':'+smsConfig.APIKEY).toString('base64');

var smsList = {}

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

/* SMS Auth Send */
router.get('/sms/:phone_number', function (req, res, next) {
  var verifyCode = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
  smsList[req.params['phone_number']] = verifyCode;

  var data = {
    "sender"     : smsConfig.SENDER,
    "receivers"  : [req.params['phone_number']],
    "content"    : util.format('[갑자기] 인증번호 [%d] 를 입력해주세요.', verifyCode)
  }
  var body = JSON.stringify(data);

  var options = {
    host: 'api.bluehouselab.com',
    port: 443,
    path: '/smscenter/v1.0/sendsms',
    headers: {
      'Authorization': credential,
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(body)
    },
    method: 'POST'
  };
  var request = https.request(options, function(response) {
    console.log(response.statusCode);
    var body = "";
    response.on('data', function(d) {
      body += d;
    });
    response.on('end', function(d) {
      if(response.statusCode == 200) {
        console.log(JSON.parse(body));
        res.send({ 'code' : 200, 'message' : 'succeed to send sms' });
      } else {
        console.log(body);
      }
    });
  });
  request.write(body);
  request.end();
  request.on('error', function(e) {
    console.error(e);
    return res.status(500).send({ 'code' : 500, 'message' : 'failed to send sms' });
  });
});

router.get('/sms/:phone_number/:verify_code', function (req, res, next) {
  if (smsList[req.params['phone_number']] == req.params['verify_code']) {
    return res.send({ 'code' : 200, 'message' : 'succeed to verify' });
  } else {
    return res.status(605).send({ 'code' : 605, 'message' : 'failed to verify' });
  }
});

router.get('/registered/:phone_number', function (req, res, next) {
  var phoneNumber = req.params['phone_number'];
  user.isExists({ 'phone_number' : phoneNumber }, function (err, user) {
    if (err) {
      console.log(err);
      return res.status(err['code']).send(err);
    }
    req.session.user = user;
    return res.json({
      'code' : 200,
      'message' : 'exists user',
      'data' : user
    });
  });
});

module.exports = router;

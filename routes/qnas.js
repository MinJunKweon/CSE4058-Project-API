var express = require('express');
var router = express.Router();
var qna = require('../models/qna');
var auth = require('../auth');

/* all my qna */
router.get('/', auth, function (req, res, next) {
    var userId = req.session.user['user_id'];
    qna.allMyQnAs(userId, function (err, qnas) {
        if (err) {
            console.log(err);
            return res.status(err['code']).send(err);
        }
        return res.json({
            'code' : 200,
            'message' : 'succeed to get all qnas',
            'data' : qnas
        });
    });
});

/* post question */
router.post('/question', auth, function (req, res, next) {
    var userId = req.session.user['user_id'];
    var title = req.body['title'];
    var content = req.body['content'];
    qna.postQuestion(userId, title, content, function (err) {
        if (err) {
            console.log(err);
            return res.status(err['code']).send(err);
        }
        return res.json({
            'code' : 200,
            'message' : 'succeed to post question'
        });
    });
});

/* post answer */
router.post('/answer/:question_id', auth, function (req, res, next) {
    var managerName = req.session.user['username'];
    var questionId = req.params['question_id'];
    var title = req.body['title'];
    var content = req.body['content'];
    qna.postAnswer(managerName, questionId, title, content, function(err) {
        if (err) {
            console.log(err);
            return res.status(err['code']).send(err);
        }
        return res.json({
            'code' : 200,
            'message' : 'succeed to post answer'
        });
    })
});

/* get all question for manager */
router.get('/manager', auth, function (erq, res, next) {
    qna.allQnAForManager(function (err, questions) {
        if (err) {
            console.log(err);
            return res.status(err['code']).send(err);
        }
        return res.json({
            'code' : 200,
            'message' : 'succeed to get all questions for manager',
            'data' : questions
        });
    });
});

module.exports = router;
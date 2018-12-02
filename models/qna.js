var db = require('../controllers/db');

var qnaify = function (result) {
    if (result['answer_id']) {
        result['answer'] = {
            'answer_id': result['answer_id'],
            'manager_name': result['manager_name'],
            'answer_title': result['answer_title'],
            'answer_content': result['answer_content'],
            'answer_created_at': result['answer_created_at']
        };
    }
    return result;
}

exports.allMyQnAs = function (userId, next) {
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err, null);
        }
        connection.query('SELECT * FROM `QUESTION` LEFT JOIN `ANSWER` ON `QUESTION`.`question_id` = `ANSWER`.`answer_question_id` WHERE `user_id` = ? ORDER BY `question_created_at` DESC',
            [userId],
            function (err, results, fields) {
                if (err) {
                    err['code'] = 500;
                    return next(err, null);
                }
                var newResults = [];
                for (idx in results) {
                    var result = results[idx];
                    newResults = newResults.concat([qnaify(result)]);
                }
                return next(null, newResults);
            });
    });
}

exports.allQnAForManager = function (next) {
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err, null);
        }
        connection.query('SELECT * FROM `QUESTION` LEFT JOIN `ANSWER` ON `QUESTION`.`question_id` = `ANSWER`.`answer_question_id` WHERE `answer_id` IS NULL ORDER BY `question_created_at` DESC',
        function (err, results, fields) {
            if (err) {
                err['code'] = 500;
                return next(err, null);
            }
            return next(null, results);
        });
    });
};

exports.postQuestion = function (userId, title, content, next) {
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err);
        }
        connection.query('INSERT INTO `QUESTION`(`user_id`, `question_title`, `question_content`) VALUES(?, ?, ?)',
        [userId, title, content],
        function (err, results, fields) {
            if (err) {
                err['code'] = 500;
                return next(err);
            }
            return next(null);
        });
    });
}

exports.postAnswer = function (managerName, questionId, title, content, next) {
    db.connection(function (err, connection) {
        if (err) {
            err['code'] = 500;
            return next(err);
        }
        connection.query('INSERT INTO `ANSWER`(`manager_name`, `answer_question_id`, `answer_title`, `answer_content`) VALUES(?, ?, ?, ?)',
        [managerName, questionId, title, content],
        function (err) {
           if (err) {
               err['code'] = 500;
               return next(err);
           } 
           return next(null);
        });
    });
}
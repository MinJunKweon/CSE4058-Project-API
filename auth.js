module.exports = function (req, res, next) {
    if (!req.session.user) {
        return res.status(403).json({ 'code': 403, 'message' : 'forbidden'});
    }
    return next();
}
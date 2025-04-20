module.exports = function (req, res, next) {
    if (req.session && req.session.isAuth) {
      next();
    } else {
      res.redirect('/login');
    }
  };
  
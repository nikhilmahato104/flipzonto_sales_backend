module.exports = function (req, res, next) {
    if (req.session && req.session.isAuth) {
      return next();
    }
  
    // If the request is from an API client (like fetch/Axios), return a 401 error
    if (req.originalUrl.includes('/api') || req.headers.accept?.includes('application/json')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    // Otherwise, it's probably a browser request — redirect to login page
    return res.redirect('/login');
  };
  
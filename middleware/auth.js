const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).send({ msg: 'No token ,auth denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.jwtToken);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).send({ msg: 'token is invalid' });
  }
};

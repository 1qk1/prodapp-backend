const jwt = require("jsonwebtoken"),
  base64 = require("js-base64").Base64,
  passport = require("passport"),
  errorMiddleware = require("./error");

const verifyToken = (req, res, next) => {
  try {
    // split the token from the Bearer
    const token = req.headers.authorization.split(" ")[1];
    // verify the token
    // if token will get verified, the jwt's content
    // will be req.user so the next function can use it
    // if jwt is invalid, it will throw an error
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    // continue
    next();
  } catch (err) {
    // if error send response
    res.handleError(err);
  }
};

const verifyPassword = (req, res, next) => {
  // authenticate username and password
  passport.authenticate(
    "local",
    // function starts here
    (error, user, info) => {
      // if there is an error send an error response
      if (error) return res.handleError(error);
      // if there is no error
      // add the user to req.user
      req.user = { username: user.username, id: user._id.toString() };
      // continue with the next function
      next();
    },
    // function ends here
    { session: false }
  )(req, res, next);
  // passport.authenticate ends here
  // This indentantion is pretty confusing
  // but prettier doesn't do me the favor
};

module.exports = {
  verifyToken,
  verifyPassword
};

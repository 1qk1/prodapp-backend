const jwt = require("jsonwebtoken"),
  User = require("../models/user"),
  CustomError = require("../middleware/error").CustomError,
  { validationResult } = require("express-validator/check");

const sendNewToken = (req, res, next) => {
  // get the user's username and id
  const { username, id, extensions } = req.user;
  const userData = {
    username,
    id
  };

  // create new token and send it back to the user
  const token = jwt.sign(userData, process.env.JWT_SECRET);
  res.json({ token, user: { ...userData, extensions } });
  // if there is a next function run it
  // so we don't need to specify the
  // next function when we don't need it
  if (next !== undefined) {
    next();
  }
};

const sendUserJSON = (req, res) => {
  User.findById(req.user.id)
    .then(user => {
      if (user !== null) {
        const userJSON = {
          username: user.username,
          id: user._id,
          extensions: user.extensions
        };
        res.json({ user: userJSON });
      } else {
        throw new CustomError(401, "Unauthorized.");
      }
    })
    .catch(res.handleError);
};

const registerHandler = (req, res) => {
  const errors = validationResult(req).array();
  if (errors.length > 0) return res.handleError(new CustomError(400, errors));

  const user = req.body;
  // check if user exists
  User.findOne({ username: user.username })
    .then(foundUser => {
      // if there is already a user with that username,
      // send an error and message
      if (foundUser !== null)
        throw new CustomError(400, "User already exists.");
      // create user
      User.create(user)
        .then(newUser => {
          // add new user's username and id
          // in req.user
          req.user = newUser;
          // and send a JWT response
          sendNewToken(req, res);
        })
        .catch(res.handleError);
    })
    .catch(res.handleError);
};

module.exports = {
  sendNewToken,
  registerHandler,
  sendUserJSON
};

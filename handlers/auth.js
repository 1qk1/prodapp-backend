const jwt = require("jsonwebtoken"),
  User = require("../models/user"),
  CustomError = require("../middleware/error").CustomError,
  { validationResult } = require("express-validator"),
  crypto = require("node:crypto"),
  dayjs = require("dayjs"),
  mailgun = require("mailgun-js")({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
  });

const sendNewToken = (req, res, next) => {
  // get the user's username and id
  const { username, id, extensions } = req.user;
  const userData = {
    username,
    id,
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
    .then((user) => {
      if (user !== null) {
        const userJSON = {
          username: user.username,
          id: user._id,
          extensions: user.extensions,
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
  User.findOne({
    $or: [
      { username: user.username },
      { email: user.email },
    ]
  })
    .then((foundUser) => {
      // if there is already a user with that username,
      // send an error and message
      if (foundUser !== null) {
        if (foundUser.email === user.email) {
          throw new CustomError(400, "Email already exists.");
        } else {
          throw new CustomError(400, "User already exists.");
        }
      }
      // create user
      User.create(user)
        .then((newUser) => {
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

const forgotPassword = (req, res) => {
  // will get the user based on the password
  const userEmail = req.body.email;
  User.findOne({ email: userEmail }).then((user) => {
    if (user) {
      // will create a user reset token based on inputted email
      crypto.randomBytes(16, function (err, buffer) {
        const token = buffer.toString("hex");
        const expirationTime = dayjs().add(20, 'minutes').toISOString();
        // will enter the reset token on the user's profile
        // along with a expiration time of 20 minutes
        user.passwordResetToken = token;
        user.passwordResetTokenValidUntil = expirationTime;
        user.save().then((user) => {
          // will send email with the reset password link
          // will return success or fail
          var emailData = {
            from: "Prodapp Support <noreply@prodapp.xyz>",
            to: userEmail,
            subject: "Password reset request",
            text: [
              "Hello,",
              "This email is sent because you requested a password change",
              "To change your password follow this link",
              "https://prodapp.xyz/reset-password/" + token,
              "Keep in mind this link is valid for 20 minutes, after that you will need to request a new recovery again",
            ],
          };
          mailgun.messages().send(emailData, function (error, body) {
            res.json({ success: true });
          });
        });
      });
    }
  });
};

const checkPasswordResetToken = (req, res) => {
  const { passwordResetToken } = req.params;
  const now = dayjs().toISOString();
  User.findOne({ passwordResetToken: passwordResetToken, passwordResetTokenValidUntil: { $gt: now } })
    .then((user) => {
      if (!user) {
        throw new CustomError(400, "Token expired");
      } else {
        res.json({ status: 200, success: true });
      }
    })
    .catch(res.handleError);
};

const resetPassword = (req, res) => {
  const errors = validationResult(req).array();
  if (errors.length > 0) return res.handleError(new CustomError(400, errors));

  const { password: newPassword } = req.body;
  const { passwordResetToken } = req.params;
  User.findOne({ passwordResetToken: passwordResetToken })
    .then((user) => {
      if (dayjs().isAfter(dayjs(user.passwordResetTokenValidUntil))) {
        throw new CustomError(400, "Token expired");
      } else {
        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetTokenValidUntil = undefined;
        user.save().then((newUser) => {
          res.json({ status: 200, success: true });
        });
      }
    })
    .catch(res.handleError);
};

module.exports = {
  sendNewToken,
  registerHandler,
  sendUserJSON,
  forgotPassword,
  resetPassword,
  checkPasswordResetToken,
};

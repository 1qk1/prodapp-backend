const router = require("express").Router(),
  authHandlers = require("../handlers/auth"),
  verifyPassword = require("../middleware/auth").verifyPassword,
  verifyToken = require("../middleware/auth").verifyToken,
  { registerValidations, passwordValidations } = require("../middleware/auth");

router.post("/register", registerValidations, authHandlers.registerHandler);

router.post(
  "/login",
  // check the credentials sent by the user
  verifyPassword,
  // if they correct, send a JWT response
  authHandlers.sendNewToken
);

// get the user data based on the encrypted data from the JWT
router.get("/getUser", verifyToken, authHandlers.sendUserJSON);

router.post("/forgot-password", authHandlers.forgotPassword);

router.get(
  "/reset-password/:passwordResetToken",
  authHandlers.checkPasswordResetToken
);
router.post(
  "/reset-password/:passwordResetToken",
  passwordValidations,
  authHandlers.resetPassword
);

module.exports = router;

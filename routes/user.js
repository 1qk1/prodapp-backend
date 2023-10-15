const router = require("express").Router()
const verifyToken = require("../middleware/auth").verifyToken
const userHandlers = require("../handlers/user")
const {
  validationCheck,
  editUser
} = require("../middleware/validators");

router.use(verifyToken);

router.post("/update", editUser, validationCheck, userHandlers.editUser);

// router.delete("/:extensionName", userHandlers.removeExtension);

module.exports = router;

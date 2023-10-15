const User = require("../models/user");
const { matchedData } = require('express-validator');


const editUser = (req, res) => {
  let matched = matchedData(req, {
    includeOptionals: true,
  })
  matched = { ...matched.user, extensionSettings: { ...matched } }
  delete matched.user
  delete matched.extensionSettings.user

  User.findByIdAndUpdate(
    req.user.id,
    matched,
  )
    .then(() => {
      res.sendStatus(200);
    })
    .catch(res.handleError);
};


module.exports = {
  editUser,
};

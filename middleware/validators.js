const { body, validationResult } = require("express-validator"),
  { CustomError } = require("./error");

const validationCheck = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.handleError(new CustomError(422, errors.array()[0].msg));
  }
  next();
};

const newBoard = [
  body("boardTitle")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Board title cannot be empty.")
];
const editBoard = [
  body("boardTitle")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Board title cannot be empty.")
];
const changeListTitle = [
  body("newTitle")
    .trim()
    .not()
    .isEmpty()
    .withMessage("List title cannot be empty.")
];
const cardText = [
  body("text")
    .optional()
    .trim()
    .not()
    .isEmpty()
    .withMessage("Card text cannot be empty.")
];

const editUser = [
  body("user.username")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Username cannot be empty.")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long."),
  body("user.email")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Email cannot be empty.")
    .isEmail()
    .withMessage("Please enter a valid email address."),
  body("pomodoro.time")
    .trim()
    .isNumeric()
    .withMessage("Pomodoro time cannot be empty."),
  body("pomodoro.break")
    .trim()
    .isNumeric()
    .withMessage("Pomodoro break time cannot be empty."),
  body("pomodoro.longBreak")
    .trim()
    .isNumeric()
    .withMessage("Pomodoro long break time cannot be empty."),
  body("pomodoro.longBreakInterval")
    .trim()
    .isNumeric()
    .withMessage("Pomodoro long break interval cannot be empty."),

]

module.exports = {
  validationCheck,
  newBoard,
  editBoard,
  changeListTitle,
  cardText,
  editUser
};

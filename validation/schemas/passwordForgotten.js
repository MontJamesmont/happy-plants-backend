const { body } = require("express-validator");
const emailNormalizationOptions = require("../emailNormalizationOptions");

const passwordForgottenSchema = [
  body("email")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage({msg: "Is required", errorCode: "is_required"})
    .isEmail()
    .withMessage({msg: "Is incorrect", errorCode: "incorrect_email" })
    .normalizeEmail(emailNormalizationOptions)
];

module.exports = passwordForgottenSchema;

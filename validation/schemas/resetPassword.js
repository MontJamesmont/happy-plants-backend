const { body } = require("express-validator");
const emailNormalizationOptions = require("../emailNormalizationOptions");
const passwordSchema = require("./fields/password");
const passwordConfirmSchema = require("./fields/passwordConfirm");

const resetPasswordSchema = [
  body("email")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage({msg: "Is required", errorCode: "is_required"})
    .isEmail()
    .withMessage({msg: "Is incorrect", errorCode: "incorrect_email" })
    .normalizeEmail(emailNormalizationOptions),
  passwordSchema,
  passwordConfirmSchema
];

module.exports = resetPasswordSchema;

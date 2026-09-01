const { check } = require("express-validator");
const emailNormalizationOptions = require("../../emailNormalizationOptions");

const emailSchema = check("email")
    .isEmail()
    .withMessage({msg: "Is incorrect", errorCode: "incorrect_email" })
    .normalizeEmail(emailNormalizationOptions);

module.exports = emailSchema;
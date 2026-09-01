const { body } = require("express-validator");

const passSchema = body("password")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage({msg: "Is required", errorCode: "is_required"})
    .isLength({ min: 8 })
    .withMessage({
        message: "Password length should be at least 8 characters.",
        errorCode: "register.password_length"
    })
    .isStrongPassword({
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    .withMessage({
        message: "Should contain a lower case letter, upper case letter, minium one of a special character and number",
        errorCode: "register.password_not_strong"
    })

module.exports = passSchema;

const { body } = require("express-validator");

const passwordConfirmationSchema = body("password_confirm")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage({msg: "Is required", errorCode: "is_required"})
    .custom((value, { req }) => {
    if (value !== req.body.password) {
        throw new Error("Password and Password confirmation are different.");
    }
        return true;
    })
    .withMessage({msg: "Password and Password confirmation are different.", errorCode: "password_confirmation_different"});

module.exports = passwordConfirmationSchema;

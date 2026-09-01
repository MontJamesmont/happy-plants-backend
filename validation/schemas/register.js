const { body } = require("express-validator");
const axios = require('axios');
const emailNormalizationOptions = require("../emailNormalizationOptions");
const User = require("../../models/User");

const registerSchema = [
  body("email")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage({msg: "Is required", errorCode: "is_required"})
    .isEmail()
    .withMessage({msg: "Is incorrect", errorCode: "incorrect_email" })
    .normalizeEmail(emailNormalizationOptions)
    .bail()
    .custom((value) => {
      return User.findOne({
          email: value,
        })
        .then((user) => {
          if (user) {
            return Promise.reject(
              "This email is in use already"
            );
          }
        })
        .catch((err) => {
          console.log(err);
          return Promise.reject();
        });
    })
    .withMessage({
      message: "This email is in use already.",
      errorCode: "register.user_exists",
    }),
  body("password")
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
    }),
  body("password_confirm")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage({msg: "Is required", errorCode: "is_required"})
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password and Password confirmation are different.");
      }
      return true;
    })
    .withMessage({msg: "Password and Password confirmation are different.", errorCode: "password_confirmation_different" })
];

module.exports = registerSchema;

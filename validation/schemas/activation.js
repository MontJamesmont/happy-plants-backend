const { body } = require("express-validator");
const emailNormalizationOptions = require("../emailNormalizationOptions");
const User = require("../../models/User");
const ResponseError = require("../../shared/responseError");

const activationSchema = [
  body("email")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage({msg: "Is required", errorCode: "is_required"})
    .isEmail()
    .withMessage({msg: "Is incorrect", errorCode: "incorrect_email" })
    .normalizeEmail(emailNormalizationOptions)
    .custom(async (value, { req }) => {
      await User.findOne({ email: value, active: false }).then((foundUser) => {
        if (foundUser) return true
        throw new ResponseError(
          "Incorrect token or account is active already.",
          401,
          "Authorization",
          "auth.incorrect_or_active"
        );
      }).catch((err) => {
        console.log("Error during user searching.", err)
        return Promise.reject(err)
      });
    })
];

module.exports = activationSchema;

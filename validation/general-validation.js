const { validationResult } = require("express-validator");

const errorFormatter = ({ msg, param, value, nestedErrors }) => {
  try {
    msg = JSON.parse(msg)
    return {
      field: param,
      message: msg.message ? msg.message : msg,
      errorCode: msg.errorCode ? msg.errorCode : undefined,
    };
  } catch (err) {
    return {
      field: param,
      message: msg.message ? msg.message : msg,
      errorCode: msg.errorCode ? msg.errorCode : undefined,
    };
  }
};

const generalValidation = (req, res, next) => {
  const errors = validationResult(req)
    .formatWith(errorFormatter)
    .array({ onlyFirstError: true });
  if (errors.length) {
    // token authorization
    if ((errors[0].field === "authorization" || errors[0].field === "authorization-key") && errors[0].errorCode !== 'beneficiary.card_is_required') {
      return res.status(401).json({
        errors: [errors[0]],
      });
      // change password token
    } else if (errors[0].field === "auth") {
      return res.status(400).json({
        errors: [errors[0]],
      });
    }
    return res.status(400).json({
      errors: errors,
    });
  }
  return next();
};

module.exports = generalValidation;

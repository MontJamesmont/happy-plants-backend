const { header } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../../models/User");
const Secret = require("../../models/Secret");
const ResponseError = require("../../shared/responseError");

const getUser = async (param, value) => {
  let user;
  if (param === '_id') value = new mongoose.Types.ObjectId(value);
  await User.findOne({
    [param]: value,
  }).then(async (foundUser) => {
    user = foundUser;
  });

  return user;
};

const verifyToken = (param, token, tokenSecret) => {
  return new Promise(async (resolve, reject) => {
    let jwtSecret;
    await Secret.findOne({
      name: tokenSecret
    }).then((foundSecret) => jwtSecret = foundSecret.value)
    try {
      const decoded = jwt.verify(token, jwtSecret);
      if (decoded && decoded[param]) {
        resolve(decoded);
      } else {
        resolve(null);
      }
    } catch (err) {
      reject(err);
    }
  });
};

const userTokenSanitizer = async (param, value, tokenSecret) => {
  const token = value.replace("Bearer ", "");
  let newHeaderValue;
  await verifyToken(param, token, tokenSecret).then(async (decoded) => {
    newHeaderValue = JSON.stringify({
      token,
      user: await getUser(param, decoded[param]),
      decoded,
    });
  });
  return newHeaderValue;
};

const getVerifyUserTokenSchema = (param, tokenSecret, shouldBeActive = true) => {
  return header("authorization")
    .custom(async (value, { req }) => {
      const token = value.replace("Bearer ", "");
      if (token) {
        await verifyToken(param, token, tokenSecret)
          .then(async (decoded) => {
            if (decoded) {
              let paramValueToSearch = decoded[param]
              let bodyParamValue = req.body[param]
              if (param === '_id') {
                paramValueToSearch = new mongoose.Types.ObjectId(paramValueToSearch);
                bodyParamValue = req.body.userId
              }

              let user;

              await User.findOne({ [param]: paramValueToSearch }).then((foundUser) => {
                if (foundUser) user = foundUser
              }).catch((err) => {
                console.log("Error during user searching.", err)
              });

              if (((user && (user.active || !shouldBeActive))) && (!bodyParamValue || bodyParamValue === decoded[param])) {
                return true;
              } else {
                throw new ResponseError(
                  "Incorrect token or account is inactive.",
                  401,
                  "Authorization",
                  "auth.incorrect_or_inactive"
                );
              }
            } else {
              throw new ResponseError(
                "Incorrect token.",
                401,
                "Authorization",
                "auth.incorrect"
              );
            }
          })
          .catch((err) => {
            console.log('verifyUserSchema, verifyToken', err);
            if(err.errorCode) 
              throw new Error(JSON.stringify({
                message: err.message,
                errorCode: err.errorCode
              }));
            else
              throw new Error(JSON.stringify({
                message: "Incorrect token.",
                errorCode: "auth.incorrect"
              }));
          });
      } else {
        throw new Error(JSON.stringify(new ResponseError(
            "Incorrect token.",
            401,
            "Authorization",
            "auth.incorrect")
        ));
      }
    })
    .bail()
    .customSanitizer((value, { req }) => {
      return userTokenSanitizer(param, value, tokenSecret);
    });
}

module.exports = {
  getVerifyUserTokenSchema,
  verifyToken,
  userTokenSanitizer,
};

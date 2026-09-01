const express = require("express");
const mongoose = require("mongoose");
const crypto = require('node:crypto')
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const registerSchema = require("../validation/schemas/register");
const User = require("../models/User");
const Secret = require("../models/Secret");
const getMailTemplateResetPassword = require("../constants/mail-resetPassword");
const getMailTemplateActivateAccount = require("../constants/mail-activateAccount");
const generalValidation = require("../validation/general-validation");
const { getVerifyUserTokenSchema } = require("../validation/schemas/verifyUser");
const activationSchema = require("../validation/schemas/activation");
const loginSchema = require("../validation/schemas/login");
const passwordForgottenSchema = require("../validation/schemas/passwordForgotten");
const resetPasswordSchema = require("../validation/schemas/resetPassword");
const ResponseError = require("../shared/responseError");
const { sendEmail } = require("../shared/emailHelper");
const createToken = require("../shared/tokenCreation");

const checkPassword = (password, user) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password).then(async (isMatch) => {
      if (isMatch) resolve(true)
      else {
        reject(new ResponseError(
          "Incorrect user or password.",
          401,
          "global",
          "auth.incorrect_login_password"
        ));
      }
    }).catch((err) => {
      reject(new ResponseError());
    });
  })
}

const login = (user, res) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      _id: user._id,
      email: user.email,
    };
    let secret = '';
    await Secret.findOne({
      name: "login"
    }).then((foundSecret) => secret = foundSecret.value)
    jwt.sign(
      payload,
      secret,
      {
        expiresIn: 3600 * 24,
      },
      (err, token) => {
        if (err) {
          console.log("Error during token creation.", err)
          reject(new ResponseError());
        } else {
          res.json({
            success: true,
            result: {
              token: token,
              email: user.email,
            },
          });
          resolve(true)
        }
      }
    );
  })
}

router.post(
  "/register",
  registerSchema,
  generalValidation,
  async (req, res, next) => {
    const newUser = new User({
      email: req.body.email,
      password: req.body.password,
      active: false,
    });

    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        return next(new ResponseError(
          "Error during salt generation.",
          500,
          "global"
        ));
      } else {
        bcrypt.hash(newUser.password, salt, (hashErr, hash) => {
          if (hashErr) {
            console.log('Error during hash generation', hashErr)
            return next(new ResponseError(
              "Error during hash generation.",
              500,
              "global"
            ));
          } else {
            newUser.password = hash;
            newUser.save().then(async (user) => {
              const payload = {
                email: user.email,
                _id: user.id,
              };
              let secret = '';
              await Secret.findOne({
                name: "accountActivation"
              }).then((foundSecret) => {
                secret = foundSecret.value
              })
              jwt.sign(payload, secret, {}, (error, token) => {
                if (error) {
                  console.log('Error during token creation', error)
                  return next(new ResponseError(
                    "Error during token creation",
                    500,
                    "global",
                    "register.email_not_sent"
                  ));
                } else {
                  sendEmail(user.email, "Account Activation for Happy Plants", getMailTemplateActivateAccount(user, token, req.get('origin')));
                  return res.json({ success: true });
                }
              });
            }).catch((error) => {
              console.log('Error during user creation', error)
              return next(new ResponseError(
                "Error during user creation",
                500,
                "global"
              ));
            });
          }
        });
      }
    });
    // }
  }
);

router.post(
  "/activateAccount",
  activationSchema,
  getVerifyUserTokenSchema("email", "accountActivation", false),
  generalValidation,
  async (req, res, next) => {
  try {
    User.findOneAndUpdate({ email: req.body.email }, { active: true }).then(
      async (user) => {
        if (!user) {
          console.log("Search of user has fault.")
          return next(new ResponseError(
            "Search of user has fault.",
            500,
            "global"
          ));
        }

        return res.json({ success: true });
      }
    ).catch((err) => {
      console.log("Error during account update.", err)
      return next(new ResponseError(
        "Error during account update.",
        500,
        "global"
      ));
    });
  } catch (err) {
    console.log("Error during account activation.", err)
    return next(new ResponseError(
      "Search of user has fault.",
      404,
      "global"
    ));
  }
});

router.post("/login", loginSchema, generalValidation, async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let user;

  await User.findOne({ email }).then((foundUser) => {
    if (foundUser) user = foundUser
  }).catch((err) => {
    console.log("Error during user searching.", err)
  });

  if (user && user.active) {
    return await checkPassword(password, user).then(async () => {
      return await login(user, res).catch((err) => {
        console.log(err)
        return next(err)
      })
    }).catch((err) => {
      console.log(err)
      return next(err)
    })
  }
  console.log("User not found or User is inactive")
  return next(new ResponseError(
    "Incorrect user or password.",
    401,
    "global",
    "auth.incorrect_login_password"
  ));
});

router.post("/passwordForgotten", passwordForgottenSchema, generalValidation, (req, res, next) => {
  User.findOne({ email: req.body.email }).then(async (user) => {
    if (!user || !user.active) {
      console.log("User not found or is not active.", user)
      return next(new ResponseError());
    } else {
      const payload = {
        email: user.email,
        _id: user._id,
      };
      let secret = '';
      await Secret.findOne({
        name: "login"
      }).then((foundSecret) => secret = foundSecret.value)
      jwt.sign(payload, secret, {}, (err, token) => {
        if (err) {
          console.log('Error during token creation.', err)
          return next(new ResponseError());
        } else {
          sendEmail(user.email, "Password Reset for Happy Plants", getMailTemplateResetPassword(user, token, req.get('origin')));
          return res.json({ success: true })
        }
      });
    }
  }).catch((err) => {
    console.log("Error during user searching.", err)
    return next(new ResponseError());
  });
});

router.get("/me", getVerifyUserTokenSchema('email', "login"), generalValidation, async (req, res, next) => {
  const auth = JSON.parse(req.header("authorization"));
  const user = auth ? auth.user : null;
  const copyUser = JSON.parse(JSON.stringify(user));
  delete copyUser.password;
  return res.json({ success: true, result: copyUser });
});

router.put("/me", getVerifyUserTokenSchema('_id', "login", true), generalValidation, async (req, res, next) => {
  const auth = JSON.parse(req.header("authorization"));
  const user = auth ? auth.user : null;
  delete req.body.email
  delete req.body.password
  delete req.body.active
  User.findOneAndUpdate(
    {
      _id: user._id,
    },
    req.body,
    {
      projection: {
        active: 0,
        password: 0
      },
      new: true
    }
  ).populate('plants').then(async (user) => {
    if (!user) {
      console.log("User not found.", err)
      return next(new ResponseError(
        "User not found.",
        404,
        "global"
      ));
    }
    return res.json({ result: user });
  }).catch((err) => {
    console.log("Error during user searching.", err)
    return next(new ResponseError(
      "Error during user searching.",
      500,
      "global"
    ));
  });
});

router.post("/logout", getVerifyUserTokenSchema('_id', "login"), generalValidation, async (req, res, next) => {
  const auth = JSON.parse(req.header("authorization"));
  const token = auth ? auth.token : null;
  if (token) {
    (new Blocked({
      value: token
    })).save();
  }
  return res.json({ success: true });
});

router.get("/checkResetPasswordAccess", async (req, res, next) => {
  try {
    let secret = '';
    await Secret.findOne({
      name: "login"
    }).then((foundSecret) => secret = foundSecret.value)
    if (
      jwt.verify(req.query.token, secret).email === req.query.email
    ) {
      return res.json({ success: true });
    } else {
      console.log("Error during reset password checking.", err)
      return next(new ResponseError(
        "Unauthorised try of password resetting",
        401,
        "email"
      ));
    }
  } catch (err) {
    console.log("Error during reset password checking.", err)
    return next(new ResponseError(
      "Error during reset password checking.",
      500,
      "global"
    ));
  }
});

router.post("/resetPassword", resetPasswordSchema, getVerifyUserTokenSchema('email', "login", true), generalValidation, async (req, res, next) => {
  try {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        console.log("Error during salt generation.", err)
        return next(new ResponseError(
          "Error during salt generation.",
          500,
          "global"
        ));
      } else {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
          if (err) {
            console.log("Error during hash generation.", err)
            return next(new ResponseError(
              "Error during hash generation.",
              500,
              "global"
            ));
          } else {
            User.findOneAndUpdate(
              { email: req.body.email },
              { password: hash }
            ).then((user) => {
              if (!user) {
                console.log("User not found.", err)
                return next(new ResponseError(
                  "User not found.",
                  404,
                  "global",
                  "reset.user_not_found"
                ));
              }
              return res.json({ success: true });
            }).catch((err) => {
              console.log("Error during searching user.", err)
              return next(new ResponseError(
                "Error during searching user.",
                500,
                "global"
              ));
            });
          }
        });
      }
    });
  } catch (err) {
    console.log("Error during password resetting.", err)
    return next(new ResponseError(
      "Error during password resetting.",
      500,
      "global"
    ));
  }
});

module.exports = router;


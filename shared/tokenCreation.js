const jwt = require("jsonwebtoken");
const Secret = require("../models/Secret");
const ResponseError = require("./responseError");

const createToken = (person) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      _id: person._id,
      email: person.email
    }
    let secret = '';
    await Secret.findOne({
      name: "appreciateBeneficiary"
    }).then((foundSecret) => {
      secret = foundSecret.value
    })
    jwt.sign(payload, secret, { expiresIn: 3600 * 24 * 7 }, (error, token) => {
      if (error) {
        console.log('Error during token creation', error)
        reject(new ResponseError(
          "Error during token creation",
          500,
          "global",
          "confirm.email_not_sent"
        ));
      } else {
        resolve(token)
      }
    });
  })
}

module.exports = createToken;
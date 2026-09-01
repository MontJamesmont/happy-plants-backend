const { body } = require("express-validator");

const nameSchema = body("name")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage({msg: "Is required", errorCode: "is_required"});

module.exports = nameSchema;

const { body } = require("express-validator");

const dateSchema = body("date")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage({msg: "Is required", errorCode: "is_required"})
    .isISO8601()
    .withMessage({msg: "Wrong date pattern", errorCode: "should_be_a_date"});

module.exports = dateSchema;

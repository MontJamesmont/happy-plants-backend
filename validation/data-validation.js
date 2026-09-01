const cleaningScheduleSchema = require("./schemas/cleaningSchedule");
const cleaningSchema = require("./schemas/cleaning");
const closingSchema = require("./schemas/closing");
const contactSchema = require("./schemas/contact");
const deliverySchema = require("./schemas/delivery");
const monthlyReviewSchema = require("./schemas/monthlyReview");
const openingSchema = require("./schemas/opening");
const probeSchema = require("./schemas/probe");
const problemSchema = require("./schemas/problem");
const proveItSchema = require("./schemas/proveIt");
const supplierSchema = require("./schemas/supplier");
const dayTemperaturesSchema = require("./schemas/dayTemperatures");
const trainingSchema = require("./schemas/training");
const dishesAllergenSchema = require("./schemas/dishesAllergen");
const foodHandlingSchema = require("./schemas/foodHandling");

const dataValidation = async (req, res, next) => {
  let validators;
  switch (req.body.action) {
    case 'cleaning':
        validators = cleaningSchema;
        break; 
    case 'training':
        validators = trainingSchema;
        break;
    case 'day-temperatures':
        validators = dayTemperaturesSchema;
        break;
    case 'supplier':
        validators = supplierSchema;
        break;
    case 'prove-it':
        validators = proveItSchema;
        break;
    case 'problem':
        validators = problemSchema;
        break;
    case 'probe':
        validators = probeSchema;
        break;
    case 'opening':
        validators = openingSchema;
        break;
    case 'monthly-review':
        validators = monthlyReviewSchema;
        break;
    case 'delivery':
        validators = deliverySchema;
        break;
    case 'contact':
        validators = contactSchema;
        break;
    case 'closing':
        validators = closingSchema;
        break;
    case 'cleaning-schedule':
        validators = cleaningScheduleSchema;
        break;
    case 'dishes-allergen':
        validators = dishesAllergenSchema;
        break;
    case 'food-handling':
        validators = foodHandlingSchema;
        break;  
  }
  for (let i = 0; i < validators.length; i++) {
    await validators[i].run(req).then(() => {
      if(i === validators.length - 1) {
        return next();
      }
    })
  };
};

module.exports = dataValidation;

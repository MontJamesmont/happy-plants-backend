const isEmpty = require('./is-empty');

module.exports = function validateFilters(filters, model) {
  let errors = [],
    filtersNotInModel = "";
  if (filters) {
    Object.getOwnPropertyNames(filters).forEach((filterName) => {
      let isInModel = false;
      model.forEach((prop) => {
        if (prop === filterName) isInModel = true;
      });
      if (!isInModel) filtersNotInModel += `${filterName} `
    });

    if (filtersNotInModel.length > 0) errors.push(`Filtry niepoprawne: ${filtersNotInModel}`)
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}
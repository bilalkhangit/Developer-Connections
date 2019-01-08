const validator = require("validator");

const isEmpty = require("./is-empty");

module.exports = function validateEducationInput(data) {
  let errors = {};

  data.school = !isEmpty(data.school) ? data.school : "";
  data.degree = !isEmpty(data.degree) ? data.degree : "";
  data.fieldOfstudy = !isEmpty(data.fieldOfstudy) ? data.fieldOfstudy : "";
  data.from = !isEmpty(data.from) ? data.from : "";

  if (validator.isEmpty(data.school)) {
    errors.title = "School field is required";
  }

  if (validator.isEmpty(data.degree)) {
    errors.degree = "Degree field is required";
  }
  if (validator.isEmpty(data.fieldOfstudy)) {
    errors.fieldOfstudy = "Field Of study field is required";
  }
  if (validator.isEmpty(data.from)) {
    errors.from = "From field is required";
  }


  return {
    errors,
    isValid: isEmpty(errors)
  };
};

const mongoose = require("mongoose");
const accountError = require("../errors/accountError");
const noteError = require("../errors/noteError");
const errorHandler = (err, req, res, next) => {
  console.log("instance of ", err instanceof mongoose.Error.CastError);
  // console.log("error from error handler", err);

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    // Handling JSON parse errors
    return res.status(400).json({ msg: "Invalid JSON", status: "Error" });
  }

  if (err.code === 11000) {
    return accountError(err, req, res);
  }
  if (err instanceof mongoose.Error.ValidationError) {
    if (err.message.includes("Account validation failed")) {
      return accountError(err, req, res);
    }
    if (err.message.includes("Notes validation failed")) {
      return noteError(err, req, res);
    }
  }
  if (err instanceof mongoose.Error) {
    if (JSON.parse(err.message).msg.includes("Incorrect")) {
      return accountError(err, req, res);
    }
  }
  if (err instanceof mongoose.Error.ObjectParameterError) {
    return res.status(400).json({ msg: "Invalid input object format", status: "Error" });
  }
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ msg: "Invalid id cast", status: "Error" });
  }
  return res.status(500).json({
    msg: "Something went wrong! Please try after some time",
    status: "Error",
  });
};
module.exports = errorHandler;

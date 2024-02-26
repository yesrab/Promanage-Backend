const mongoose = require("mongoose");
const account = (err, req, res, next) => {
  // console.log("inside Account Error handler");

  const error = {
    Name: "",
    Email: "",
    Password: "",
    status: "Error",
  };
  if (err.code === 11000) {
    error.Email = "This Email account already exists";
    return res.status(400).json(error);
  }
  if (err instanceof mongoose.Error.ValidationError) {
    Object.values(err.errors).forEach(({ properties }) => {
      error[properties.path] = properties.message;
    });
    return res.status(400).json(error);
  }
  if (err instanceof mongoose.Error) {
    if (JSON.parse(err.message).msg.includes("Incorrect")) {
      const errobj = JSON.parse(err.message);
      error[errobj.path] = errobj.msg;
      // console.log(error);
      return res.status(401).json(error);
    }
  }
  return res.status(500).json({
    msg: "Something went wrong! Please try after some time",
    status: "Error",
  });
};
module.exports = account;

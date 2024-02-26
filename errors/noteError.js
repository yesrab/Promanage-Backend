const mongoose = require("mongoose");

const notesError = (err, req, res, next) => {
  const error = {
    title: "",
    dueDate: "",
    Priority: "",
    section: "",
    createdBy: "",
    visibility: "",
    todos: "",
  };

  if (err instanceof mongoose.Error.ValidationError) {
    Object.values(err.errors).forEach(({ properties }) => {
      error[properties.path] = properties.message;
    });
    return res.status(400).json(error);
  }

  return res.status(500).json({
    msg: "Something went wrong! Please try after some time",
    status: "Error",
  });
};

module.exports = notesError;

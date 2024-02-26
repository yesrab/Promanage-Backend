const Account = require("../model/account");
const jwt = require("jsonwebtoken");
const secrete = process.env.JWT_SUPER_SEACRETE || "superGupthKey";
const bcrypt = require("bcrypt");

const createToken = (obj) => {
  return jwt.sign(obj, secrete);
};

const registerAccount = async (req, res) => {
  const { Name, Email, Password, confirmPassword } = req.body;
  // console.log("this is register acc body", req.body);
  const data = await Account.create({ Name, Email, Password });
  res.json({ data, status: "success" });
};

const login = async (req, res) => {
  const { Email, Password } = req.body;
  const user = await Account.login(Email, Password);
  const { _id, Name, Email: resEmail } = user;
  const id = _id.toString();
  const token = createToken({ id, Email: resEmail });
  res.status(202).json({ id, Name, Email: resEmail, token, status: "success" });
};

const reset = async (req, res) => {
  const { tokenData } = res.locals;
  const { name, oldPassword, password } = req.body;
  if (name && !oldPassword && !password) {
    const userData = await Account.findByIdAndUpdate(
      { _id: tokenData.id },
      {
        Name: name,
      },
      { new: true }
    );
    if (userData) {
      return res
        .status(202)
        .json({ status: "success", userData, id: tokenData.id });
    }
    return res.status(404).json({ status: "Error", msg: "Account not found" });
  } else if (!name && oldPassword && password) {
    const userFind = await Account.findById(tokenData.id);
    if (!userFind) {
      return res
        .status(404)
        .json({ status: "Error", msg: "Incorrect passowrd" });
    }
    const user = await Account.login(userFind.Email, oldPassword);
    if (user) {
      userFind.Password = password;
      const userData = await userFind.save();
      return res.status(202).json({ status: "success", userData });
    }
    return res.status(404).json({ status: "Error", msg: "Account not found" });
  } else if (name && oldPassword && password) {
    const userFind = await Account.findById(tokenData.id);
    if (!userFind) {
      return res
        .status(404)
        .json({ status: "Error", msg: "Incorrect passowrd" });
    }
    const user = await Account.login(userFind.Email, oldPassword);
    if (user) {
      userFind.Password = password;
      userFind.Name = name;
      const userData = await userFind.save();
      return res.status(202).json({ status: "success", userData });
    }
    return res.json({ status: "Error", msg: "Account not found" });
  } else {
    return res.status(400).json({ msg: "invalid submittion", status: "Error" });
  }
  res.status(404).json({ status: "Error", msg: "Account not found" });
};
module.exports = { registerAccount, login, reset };

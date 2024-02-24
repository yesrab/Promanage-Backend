const Account = require("../model/account");
const jwt = require("jsonwebtoken");
const secrete = process.env.JWT_SUPER_SEACRETE || "superGupthKey";

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
  const token = createToken({ id, Name, Email: resEmail });
  // res.cookie("token", token, { httpOnly: true, maxAge: maxAge * 1000 });
  // console.log("login information sent", token);
  res.status(202).json({ id, Name, Email: resEmail, token, status: "success" });
};

module.exports = { registerAccount, login };

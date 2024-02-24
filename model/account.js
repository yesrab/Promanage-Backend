const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const AccountSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  Email: {
    type: String,
    unique: true,
    required: [true, "Email is required"],
  },

  Password: {
    type: String,
    required: [true, "Please set a valid password"],
  },
});
//encrypt passwords before saving them

AccountSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.Password = await bcrypt.hash(this.Password, salt);
  next();
});

//mongoose static method to login
AccountSchema.statics.login = async function (Email, Password) {
  const user = await this.findOne({ Email });
  if (user) {
    const auth = await bcrypt.compare(Password, user.Password);
    if (auth) {
      return user;
    }
    throw new mongoose.Error(
      JSON.stringify({ path: "password", msg: "Incorrect email/password" })
    );
  }
  throw new mongoose.Error(
    JSON.stringify({ path: "Email", msg: "Incorrect email/password" })
  );
};

const Account = mongoose.model("Account", AccountSchema);
module.exports = Account;

const express = require("express");
const router = express.Router();
const { registerAccount, login } = require("../controllers/account");
router.route("/register").post(registerAccount);
router.route("/login").post(login);
module.exports = router;

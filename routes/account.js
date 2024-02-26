const express = require("express");
const router = express.Router();
const { registerAccount, login, reset } = require("../controllers/account");
const { requireAuth } = require("../middleware/authMiddleware");
router.route("/register").post(registerAccount);
router.route("/login").post(login);
router.route("/reset").put(requireAuth, reset);
module.exports = router;

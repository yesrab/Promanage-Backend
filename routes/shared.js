const express = require("express");
const router = express.Router();
const { changeVisibility, publicCards } = require("../controllers/shared");
const { requireAuth } = require("../middleware/authMiddleware");
router.route("/Visibility").patch(requireAuth, changeVisibility);
router.route("/:sharedCard").get(publicCards);
module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getAllNotes,
  addNote,
  alterNote,
  updateNote,
  deleteNote,
  analytics,
} = require("../controllers/notes");
const { requireAuth } = require("../middleware/authMiddleware");
router
  .route("/getallnotes")
  .get(requireAuth, getAllNotes)
  .post(requireAuth, addNote)
  .patch(requireAuth, alterNote)
  .put(requireAuth, updateNote)
  .delete(requireAuth, deleteNote);

router.route("/analytics").get(requireAuth, analytics);

module.exports = router;

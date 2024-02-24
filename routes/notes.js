const express = require("express");
const router = express.Router();
const {
  getAllNotes,
  addNote,
  alterNote,
  updateNote,
  deleteNote,
} = require("../controllers/notes");
const { requireAuth } = require("../middleware/authMiddleware");
router
  .route("/getallnotes")
  .get(requireAuth, getAllNotes)
  .post(requireAuth, addNote)
  .patch(requireAuth, alterNote)
  .put(requireAuth, updateNote)
  .delete(requireAuth, deleteNote);

module.exports = router;

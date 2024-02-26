const Note = require("../model/notes");

const changeVisibility = async (req, res) => {
  const { tokenData, clientTime, timefilter } = res.locals;
  const { noteId } = req.body;

  if (!noteId) {
    return res.status(404).json({
      msg: `given note id : ${noteId} not found `,
      status: "Error",
    });
  }
  const updatedNote = await Note.findOneAndUpdate(
    { _id: noteId, createdBy: tokenData.id },
    { $set: { visibility: "public" } }, // Use $set operator to update specific fields
    { new: true }
  );

  if (!updatedNote) {
    return res.status(404).json({
      msg: `given note not found `,
      status: "Error",
    });
  }

  res.json({ updatedNote, status: "success" });
};

const publicCards = async (req, res) => {
  try {
    const sharedCard = req.params.sharedCard;
    if (!sharedCard) {
      return res.status(404).json({ msg: "card not found", status: "Error" });
    }
    const card = await Note.findOne({ _id: sharedCard, visibility: "public" });
    if (!card) {
      return res.status(404).json({ msg: "card not found", status: "Error" });
    }
    return res.json({ card, status: "success" });
  } catch (e) {
    return res.status(400).json({
      msg: "card not found",
      status: "Error",
    });
  }
};

module.exports = { changeVisibility, publicCards };

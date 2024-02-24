const Note = require("../model/notes");
const mongoose = require("mongoose");
const getAllNotes = async (req, res) => {
  const { tokenData, clientTime, timefilter } = res.locals;
  // console.log("time recived:", timefilter);

  if (!tokenData || !clientTime || !timefilter) {
    return res
      .status(406)
      .json({ msg: "request data missing", status: "Error" });
  }
  let startDate;

  switch (timefilter) {
    case "This Month":
      startDate = new Date(clientTime);
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "This Week":
      startDate = new Date(clientTime);
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "Today":
      startDate = new Date(clientTime);
      startDate.setHours(0, 0, 0, 0);
      console.log(startDate);
      break;
    default:
      return res
        .status(400)
        .json({ msg: "Invalid time filter", status: "Error" });
  }

  const note = await Note.find({
    createdBy: tokenData.id,
    createdAt: { $gte: startDate, $lte: new Date(clientTime) },
  });

  res
    .status(200)
    .json({ createdBy: tokenData.id, data: note, status: "success" });
};

const addNote = async (req, res) => {
  const { title, dueDate, Priority, section, todos } = req.body;
  const { tokenData, clientTime, timefilter } = res.locals;
  console.log(tokenData.id);

  const submittedNote = await Note.create({
    title,
    dueDate,
    Priority,
    section,
    todos,
    createdBy: tokenData.id,
  });
  // console.log(req.body);
  res.json(submittedNote);
};

const alterNote = async (req, res) => {
  console.log("switch section triggerd");
  const { tokenData, clientTime, timefilter } = res.locals;
  // console.log(req.body);
  const { noteId, section: recivedSection, todoId, updateBoolean } = req.body;
  // console.log(noteId);
  // console.log(todoId);

  if (todoId && noteId) {
    const note = await Note.findOne({
      _id: noteId,
      createdBy: tokenData.id,
    });

    if (!note) {
      return res
        .status(404)
        .json({ message: "Note not found", status: "Error" });
    }
    // console.log(note.todos[1]._id.toString());
    const indexOfTodo = note.todos.findIndex(
      (noteObj) => noteObj._id.toString() === todoId
    );
    console.log("this is the index:", indexOfTodo);

    if (indexOfTodo !== -1) {
      note.todos[indexOfTodo].check = !note.todos[indexOfTodo].check;
      const updatedNote = await note.save();
      return res.status(202).json({ updateNote, status: "success" });
    } else {
      return res
        .status(404)
        .json({ message: "Note not found", status: "Error" });
    }
  }
  const note = await Note.findOne({ _id: noteId, createdBy: tokenData.id });
  if (!note) {
    return res.status(404).json({ message: "Note not found", status: "Error" });
  }
  note.section = recivedSection;
  const updatedNote = await note.save();
  // console.log(updatedNote);
  res.json({ updatedNote, status: "success" });
};

const deleteNote = async (req, res) => {
  const { tokenData, clientTime, timefilter } = res.locals;
  const { noteId } = req.body;
  console.log(noteId);
  console.log(tokenData.id);
  if (!noteId) {
    res.status(404).json({ message: "Note id not provided", status: "Error" });
  }
  const deletedNote = await Note.deleteOne({
    _id: noteId,
    createdBy: tokenData.id,
  });
  if (deletedNote.acknowledged === true) {
    return res.status(200).json({ deletedNote, status: "success" });
  }
  res.status(404).json({ message: "Note not found", status: "Error" });
};

const updateNote = async (req, res) => {
  const { tokenData, clientTime, timefilter } = res.locals;
  const { noteId, title, dueDate, Priority, section, todos } = req.body;
  const updatedDoc = await Note.findByIdAndUpdate(
    {
      _id: noteId,
      createdBy: tokenData.id,
    },
    {
      title: title,
      dueDate: dueDate,
      Priority: Priority,
      section: section,
      todos: todos,
    },
    { new: true }
  );
  console.log(updatedDoc);
  res.json({ updatedDoc });
};

const analytics = async (req, res) => {
  const { tokenData, clientTime, timefilter } = res.locals;
  const { noteId } = req.body;
  console.log(noteId);
  const created = new mongoose.Types.ObjectId(noteId);
  const pipeline = [
    { $match: { createdBy: created } },
    {
      $project: {
        todos: 1,
        Priority: 1,
        section: 1,
        dueDate: 1,
      },
    },
    {
      $project: {
        completedTasks: {
          $size: {
            $filter: {
              input: "$todos",
              cond: { $eq: ["$$this.check", true] },
            },
          },
        },
        lowPriority: {
          $size: {
            $filter: {
              input: "$todos",
              cond: {
                $and: [
                  { $eq: ["$$this.Priority", "LOW"] },
                  { $eq: ["$$this.check", false] },
                ],
              },
            },
          },
        },
        moderatePriority: {
          $size: {
            $filter: {
              input: "$todos",
              cond: {
                $and: [
                  { $eq: ["$$this.Priority", "MODERATE"] },
                  { $eq: ["$$this.check", false] },
                ],
              },
            },
          },
        },
        highPriority: {
          $size: {
            $filter: {
              input: "$todos",
              cond: {
                $and: [
                  { $eq: ["$$this.Priority", "HIGH"] },
                  { $eq: ["$$this.check", false] },
                ],
              },
            },
          },
        },
        dueDateTasks: {
          $size: {
            $filter: {
              input: "$todos",
              cond: {
                $and: [
                  { $ne: ["$dueDate", null] },
                  { $eq: ["$$this.check", false] },
                ],
              },
            },
          },
        },
        backLogTasks: {
          $size: {
            $filter: {
              input: "$todos",
              cond: {
                $and: [
                  { $eq: ["$$this.section", "backlog"] },
                  { $eq: ["$$this.check", false] },
                ],
              },
            },
          },
        },
        todoTasks: {
          $size: {
            $filter: {
              input: "$todos",
              cond: {
                $and: [
                  { $eq: ["$$this.section", "todo"] },
                  { $eq: ["$$this.check", false] },
                ],
              },
            },
          },
        },
        inProgressTasks: {
          $size: {
            $filter: {
              input: "$todos",
              cond: {
                $and: [
                  { $eq: ["$$this.section", "inProgress"] },
                  { $eq: ["$$this.check", false] },
                ],
              },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        completedTasks: { $sum: "$completedTasks" },
        lowPriority: { $sum: "$lowPriority" },
        moderatePriority: { $sum: "$moderatePriority" },
        highPriority: { $sum: "$highPriority" },
        dueDateTasks: { $sum: "$dueDateTasks" },
        backLogTasks: { $sum: "$backLogTasks" },
        todoTasks: { $sum: "$todoTasks" },
        inProgressTasks: { $sum: "$inProgressTasks" },
      },
    },
  ];
  const data = await Note.aggregate(pipeline);

  res.status(200).json({ user: noteId, created, data });
};

module.exports = {
  getAllNotes,
  addNote,
  alterNote,
  updateNote,
  deleteNote,
  analytics,
};

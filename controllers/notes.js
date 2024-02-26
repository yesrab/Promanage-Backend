const Note = require("../model/notes");
const mongoose = require("mongoose");
const getAllNotes = async (req, res) => {
  const { tokenData, clientTime, timefilter } = res.locals;
  // console.log("time recived:", timefilter);
  if (!tokenData || !clientTime || !timefilter) {
    return res.status(400).json({ msg: "request data missing", status: "Error" });
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
      // console.log(startDate);
      break;
    default:
      return res.status(400).json({ msg: "Invalid time filter", status: "Error" });
  }

  const note = await Note.find({
    createdBy: tokenData.id,
    createdAt: { $gte: startDate, $lte: new Date(clientTime) },
  });

  res.status(200).json({ createdBy: tokenData.id, data: note, status: "success" });
};

const addNote = async (req, res, next) => {
  const { title, dueDate, Priority, section, todos } = req.body;
  const { tokenData, clientTime, timefilter } = res.locals;
  // console.log(tokenData.id);
  if (typeof todos != "object") {
    return res.status(400).json({
      status: "Error",
      msg: "todo needs to be and array of objects",
    });
  }
  const submittedNote = await Note.create({
    title,
    dueDate,
    Priority,
    section,
    todos,
    createdBy: tokenData.id,
  });
  return res.status(201).json({ submittedNote, status: "success" });

  // console.log(submittedNote);
};

const alterNote = async (req, res) => {
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
      return res.status(404).json({ message: "Note not found", status: "Error" });
    }
    // console.log(note.todos[1]._id.toString());
    const indexOfTodo = note.todos.findIndex((noteObj) => noteObj._id.toString() === todoId);
    // console.log("this is the index:", indexOfTodo);

    if (indexOfTodo !== -1) {
      note.todos[indexOfTodo].check = !note.todos[indexOfTodo].check;
      const updatedNote = await note.save();
      return res.status(202).json({ updatedNote, status: "success" });
    } else {
      return res.status(404).json({ message: "Note not found", status: "Error" });
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
  // console.log(updatedDoc);
  res.json({ updatedDoc, status: "success" });
};

const analytics = async (req, res) => {
  const { tokenData, clientTime, timefilter } = res.locals;

  const created = new mongoose.Types.ObjectId(tokenData.id);

  const priorityPipeline = [
    {
      $match: { createdBy: created }, // Filter by createdBy id
    },
    {
      $unwind: "$todos", // Deconstruct the todos array
    },
    {
      $group: {
        _id: null, // Group all documents
        lowPriority: {
          $sum: {
            $cond: [
              {
                $and: [{ $eq: ["$Priority", "LOW"] }, { $eq: ["$todos.check", false] }],
              },
              1,
              0,
            ],
          },
        },
        moderatePriority: {
          $sum: {
            $cond: [
              {
                $and: [{ $eq: ["$Priority", "MODERATE"] }, { $eq: ["$todos.check", false] }],
              },
              1,
              0,
            ],
          },
        },
        highPriority: {
          $sum: {
            $cond: [
              {
                $and: [{ $eq: ["$Priority", "HIGH"] }, { $eq: ["$todos.check", false] }],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ];

  const taskPipeline = [
    {
      $match: { createdBy: created },
    },
    {
      $project: {
        todos: 1,
        section: 1,
      },
    },
    {
      $unwind: "$todos", // Unwind the todos array
    },
    {
      $match: {
        "todos.check": false, // Filter out only the unchecked todos
      },
    },
    {
      $group: {
        _id: "$section",
        count: {
          $sum: 1,
        }, // Count the number of todos in each section
      },
    },
    {
      $project: {
        taskType: {
          $switch: {
            branches: [
              {
                case: {
                  $eq: ["$_id", "backlog"],
                },
                then: "backlogTask",
              },
              {
                case: {
                  $eq: ["$_id", "todo"],
                },
                then: "todoTask",
              },
              {
                case: {
                  $eq: ["$_id", "inProgress"],
                },
                then: "inProgressTask",
              },
            ],
            default: "doneTask",
          },
        },
        count: 1,
      },
    },
    {
      $group: {
        _id: null,
        tasks: {
          $push: {
            k: "$taskType",
            v: "$count",
          },
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $arrayToObject: "$tasks",
        },
      },
    },
  ];

  const dueDatePipeline = [
    {
      $match: {
        createdBy: created,
        dueDate: { $ne: null }, // Filter notes with a dueDate
      },
    },
    {
      $project: {
        todos: 1,
      },
    },
    {
      $unwind: "$todos", // Unwind the todos array
    },
    {
      $group: {
        _id: null,
        totalTodosWithDueDate: { $sum: 1 }, // Count the number of todos associated with notes that have a dueDate
      },
    },
    {
      $project: {
        _id: 0,
        totalTodosWithDueDate: 1,
      },
    },
  ];

  const compleatedPipeline = [
    {
      $match: {
        "createdBy": created,
        "todos.check": true, // Filter todos where check is true
      },
    },
    {
      $project: {
        todos: 1,
      },
    },
    {
      $unwind: "$todos", // Unwind the todos array
    },
    {
      $match: {
        "todos.check": true, // Filter todos where check is true
      },
    },
    {
      $group: {
        _id: null,
        totalCheckedTodos: { $sum: 1 }, // Count the number of checked todos
      },
    },
    {
      $project: {
        _id: 0,
        totalCheckedTodos: 1,
      },
    },
  ];
  const compleatedData = await Note.aggregate(compleatedPipeline);
  const dueDateData = await Note.aggregate(dueDatePipeline);
  const taskData = await Note.aggregate(taskPipeline);
  const priorityData = await Note.aggregate(priorityPipeline);

  const anyliticsData = {
    ...compleatedData[0],
    ...dueDateData[0],
    ...taskData[0],
    ...priorityData[0],
  };

  res.status(200).json({
    user: created,
    anyliticsData,
    status: "success",
  });
};

module.exports = {
  getAllNotes,
  addNote,
  alterNote,
  updateNote,
  deleteNote,
  analytics,
};

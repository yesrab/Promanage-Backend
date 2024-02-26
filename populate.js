require("dotenv").config();
const mongoose = require("mongoose");
const db = process.env.DB;
const NotesModel = require("./model/notes");
mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const data = [
  {
    id: "lol",
    title: "first note supposed to be in todo",
    dueDate: "2024-02-10",
    Priority: "HIGH",
    section: "todo",
    createdBy: "65d74008f6b337f247f03e5b",
    todos: [
      {
        note: 5,
        check: true,
        value: "haha",
      },
      {
        note: 2,
        check: false,
        value: "make me do it",
      },
    ],
  },
  {
    id: "nol",
    title: "in done",
    dueDate: "",
    Priority: "LOW",
    section: "done",
    createdBy: "65d74008f6b337f247f03e5b",
    todos: [
      {
        note: 3,
        check: false,
        value: "yes yes",
      },
      {
        note: 2,
        check: false,
        value: "no no",
      },
    ],
  },
  {
    id: "jol",
    title: "in backlog",
    dueDate: "",
    Priority: "MODERATE",
    section: "backlog",
    createdBy: "65d74008f6b337f247f03e5b",
    todos: [
      {
        note: 3,
        check: false,
        value: "yes yes",
      },
      {
        note: 2,
        check: false,
        value: "no no",
      },
    ],
  },
  {
    id: "kol",
    title: "progerss",
    dueDate: "",
    Priority: "LOW",
    section: "inProgress",
    createdBy: "65d74008f6b337f247f03e5b",
    todos: [
      {
        note: 3,
        check: false,
        value: "yes yes",
      },
      {
        note: 2,
        check: false,
        value: "no no",
      },
      {
        note: 7,
        check: false,
        value: "no sadasdasd no",
      },
    ],
  },
];

async function populateDatabase() {
  try {
    // Clear existing data
    await NotesModel.deleteMany({});
    // console.log("Cleared existing data.");

    // Populate with new data
    const insertedData = await NotesModel.insertMany(data);
    // console.log("Data inserted successfully:", insertedData);
  } catch (error) {
    console.error("Error populating data:", error);
  } finally {
    // Close the connection
    mongoose.connection.close();
  }
}
populateDatabase();

const mongoose = require("mongoose");
const NotesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    dueDate: {
      type: Date,
    },
    Priority: {
      type: String,
      required: [true, "Please select a Priority type"],
      enum: {
        values: ["HIGH", "LOW", "MODERATE"],
        message: "{VALUE} is not supported Priority",
      },
    },
    section: {
      type: String,
      required: [true, "Please Select the section this note Belongs to"],
      enum: {
        values: ["inProgress", "todo", "done", "backlog"],
        message: "{VALUE} is not a supported section",
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    visibility: {
      type: String,
      default: "private",
      enum: {
        values: ["private", "public"],
        message: "{VALUE} is not a supported visibility",
      },
    },
    todos: {
      type: [
        {
          note: {
            type: Number,
            required: true,
          },
          check: {
            type: Boolean,
            default: false,
          },
          value: {
            type: String,
            required: true,
            trim: true,
          },
        },
      ],
      required: true,
    },
  },
  { timestamps: true }
);

NotesSchema.pre("save", function (next) {
  if (this.dueDate) {
    this.dueDate = new Date(this.dueDate);
  }
  next();
});

const Note = mongoose.model("Notes", NotesSchema);
module.exports = Note;

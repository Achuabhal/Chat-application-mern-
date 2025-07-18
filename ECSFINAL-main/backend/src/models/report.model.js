import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reportedMessage: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "GroupMessage", 
      required: true 
    },
    reporter: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    reason: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String 
    },
    status: { 
      type: String, 
      enum: ["Pending", "Reviewed"], 
      default: "Pending" 
    },
    // Snapshot fields for the reported message:
    messageText: { type: String },
    messageImage: { type: String },
    messageFile: { type: String },
    messageFileName: { type: String },
    // Snapshot fields for the user who sent the reported message:
    reportedUserName: { type: String },
    reportedUserEmail: { type: String },
    reportedUserCourse: { type: String },
    reportedUserSemester: { type: String },
    // Snapshot fields for the reporter:
    reporterName: { type: String },
    reporterEmail: { type: String },
    reporterCourse: { type: String },
    reporterSemester: { type: String },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
export default Report;

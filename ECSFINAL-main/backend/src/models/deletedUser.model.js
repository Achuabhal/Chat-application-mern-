import mongoose from "mongoose";

const deletedUserSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    collegeName: String,
    course: String,
    semester: String,
    createdAt: Date,
    deletedAt: { type: Date, default: Date.now },
    deletionReason: String,
  },
  { timestamps: true }
);

const DeletedUser = mongoose.model("DeletedUser", deletedUserSchema);
export default DeletedUser;

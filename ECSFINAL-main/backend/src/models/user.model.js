 import mongoose from "mongoose";
 
 const userSchema = new mongoose.Schema(
   {
     email: {
       type: String,
       required: true,
       unique: true,
     },
     fullName: {
       type: String,
       required: true,
     },
     password: {
       type: String,
       required: true,
       minlength: 6,
     },
     profilePic: {
       type: String,
       default: "",
     },

     collegeName: { type: String, required: true },
    course: { type: String, required: true },
    semester: { type: String, required: true },
    

    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isAdmin: { type: Boolean, default: false },

    isBanned: { type: Boolean, default: false }

   },
   { timestamps: true }
 );
 
 const User = mongoose.model("User", userSchema);
 
 export default User;
 
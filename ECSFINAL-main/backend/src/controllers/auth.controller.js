import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password,  collegeName, course, semester } = req.body;
  try {
    if (!fullName || !email || !password || !collegeName || !course || !semester) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      collegeName,
      course,
      semester,
    });

    if (newUser) {
      // generate jwt token here
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        collegeName: newUser.collegeName ,
        course: newUser.course,
        semester: newUser.semester ,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }


    if (user.isBanned) {
      return res.status(403).json({ message: "Your account has been banned." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      collegeName: user.collegeName, // if needed
      course: user.course,           // add this
      semester: user.semester,       // add this
      isAdmin: user.isAdmin || false, // ✅ Ensure isAdmin is always included
      blockedUsers: user.blockedUsers.map((blocked) => blocked._id.toString()) || [],
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateSemester = async (req, res) => {
  try {
    console.log("User ID:", req.user._id);
    console.log("Course:", req.body.semester);

    const { semester } = req.body;
    const userId = req.user._id;

    if (!semester) {
      console.log("Validation failed: Semester is required");
      return res.status(400).json({ message: "Semester is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { semester },
      { new: true }
    );

    if (!updatedUser) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Semester updated successfully:", updatedUser.semester);
    res.status(200).json({ semester: updatedUser.semester });
  } catch (error) {
    console.error("Error in updateSemester:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const checkAuth = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    const user = await User.findById(req.user._id).select("-password").populate("blockedUsers");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      collegeName: user.collegeName, // ✅ Ensure this is included
      course: user.course,
      semester: user.semester,
      isAdmin: user.isAdmin, // ✅ Include Admin Status
      blockedUsers: user.blockedUsers.map(user => user._id.toString()) || [],
    });
  } catch (error) {
    console.error("Error in checkAuth controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};




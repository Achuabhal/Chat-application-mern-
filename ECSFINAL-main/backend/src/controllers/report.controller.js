import Report from "../models/report.model.js";
import GroupMessage from "../models/groupMessage.model.js";
import Message from "../models/message.model.js"; // Direct message model

export const submitReport = async (req, res) => {
  try {
    const { reportedMessage, reason, description } = req.body;
    const reporter = req.user._id;

    if (!reportedMessage || !reason) {
      return res.status(400).json({ message: "Reported message and reason are required." });
    }

    // Get reporter details from req.user
    const reporterUser = req.user;

    // Try to find the reported message in the GroupMessage collection
    let reportedMessageDoc = await GroupMessage.findById(reportedMessage)
      .populate("senderId", "fullName email course semester");

    // If not found, try to find it in the direct Message collection
    if (!reportedMessageDoc) {
      reportedMessageDoc = await Message.findById(reportedMessage)
        .populate("senderId", "fullName email course semester");
    }

    if (!reportedMessageDoc) {
      return res.status(404).json({ message: "Reported message not found." });
    }

    // Create a new report with snapshot data from the reported message
    const report = new Report({
      reportedMessage,
      reporter,
      reason,
      description,
      // Snapshot fields from the reported message:
      messageText: reportedMessageDoc.text,
      messageImage: reportedMessageDoc.image,
      messageFile: reportedMessageDoc.file,
      messageFileName: reportedMessageDoc.fileName,
      // Snapshot fields for the user who sent the reported message:
      reportedUserName: reportedMessageDoc.senderId?.fullName || "Unknown User",
      reportedUserEmail: reportedMessageDoc.senderId?.email || "Unknown",
      reportedUserCourse: reportedMessageDoc.senderId?.course || "Unknown",
      reportedUserSemester: reportedMessageDoc.senderId?.semester || "Unknown",
      // Snapshot fields for the reporter:
      reporterName: reporterUser.fullName,
      reporterEmail: reporterUser.email,
      reporterCourse: reporterUser.course,
      reporterSemester: reporterUser.semester,
    });

    await report.save();
    res.status(201).json({ message: "Report submitted successfully." });
  } catch (error) {
    console.error("Error in submitReport:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reportedMessage", "text image file fileName")
      .populate("reporter", "fullName email course semester");
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error in getReports:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markReportAsReviewed = async (req, res) => {
  try {
    const { id } = req.params;
    await Report.findByIdAndUpdate(id, { status: "Reviewed" });
    res.status(200).json({ message: "Report marked as reviewed." });
  } catch (error) {
    console.error("Error in markReportAsReviewed:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

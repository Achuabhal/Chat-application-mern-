import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axiosInstance.get("/reports");
      setReports(res.data);
    } catch (error) {
      toast.error("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  const markAsReviewed = async (id) => {
    try {
      await axiosInstance.put(`/reports/${id}/review`);
      toast.success("Report marked as reviewed.");
      setReports(
        reports.map((report) =>
          report._id === id ? { ...report, status: "Reviewed" } : report
        )
      );
    } catch (error) {
      toast.error("Failed to update report status.");
    }
  };

  if (loading) return <p className="p-6">Loading reports...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Message Reports</h2>
      {reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Reporter Info</th>
              <th className="border p-2">Reported Message Info</th>
              <th className="border p-2">Reported User Info</th>
              <th className="border p-2">Reason</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report._id} className="text-center">
                {/* Reporter Info */}
                <td className="border p-2 text-left">
                  {report.reporter ? (
                    <>
                      <strong>Name:</strong> {report.reporter.fullName} <br />
                      <strong>Email:</strong> {report.reporter.email} <br />
                      <strong>Course:</strong> {report.reporter.course} <br />
                      <strong>Semester:</strong> {report.reporter.semester}
                    </>
                  ) : (
                    <>
                      <strong>Name:</strong> {report.reporterName || "Deleted User"} <br />
                      <strong>Email:</strong> {report.reporterEmail || "N/A"} <br />
                      <strong>Course:</strong> {report.reporterCourse || "N/A"} <br />
                      <strong>Semester:</strong> {report.reporterSemester || "N/A"}
                    </>
                  )}
                </td>
                {/* Reported Message Info */}
                <td className="border p-2 text-left">
                  <strong>Text:</strong> {report.messageText || "N/A"} <br />
                  {report.messageImage && (
                    <>
                      <strong>Image:</strong>{" "}
                      <img
                        src={report.messageImage}
                        alt="Reported"
                        className="w-12 h-12 inline-block ml-1"
                      />{" "}
                      <br />
                    </>
                  )}
                  {report.messageFile && (
                    <>
                      <strong>File:</strong>{" "}
                      <a
                        href={report.messageFile}
                        download={report.messageFileName || "File"}
                        className="text-blue-500 underline"
                      >
                        {report.messageFileName || "Download"}
                      </a>
                    </>
                  )}
                </td>
                {/* Reported User Info */}
                <td className="border p-2 text-left">
                  {report.reportedUser ? (
                    <>
                      <strong>Name:</strong> {report.reportedUser.fullName} <br />
                      <strong>Email:</strong> {report.reportedUser.email} <br />
                      <strong>Course:</strong> {report.reportedUser.course} <br />
                      <strong>Semester:</strong> {report.reportedUser.semester}
                    </>
                  ) : (
                    <>
                      <strong>Name:</strong> {report.reportedUserName || "Deleted User"} <br />
                      <strong>Email:</strong> {report.reportedUserEmail || "N/A"} <br />
                      <strong>Course:</strong> {report.reportedUserCourse || "N/A"} <br />
                      <strong>Semester:</strong> {report.reportedUserSemester || "N/A"}
                    </>
                  )}
                </td>
                <td className="border p-2">{report.reason}</td>
                <td className="border p-2">{report.description || "N/A"}</td>
                <td className={`border p-2 ${report.status === "Reviewed" ? "text-green-500" : "text-red-500"}`}>
                  {report.status}
                </td>
                <td className="border p-2">
                  {report.status === "Pending" && (
                    <button
                      onClick={() => markAsReviewed(report._id)}
                      className="bg-blue-500 text-white px-4 py-1 rounded"
                    >
                      Mark as Reviewed
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminReports;

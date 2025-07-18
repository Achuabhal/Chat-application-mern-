import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios.js";

const DeletedUsers = () => {
  const [deletedUsers, setDeletedUsers] = useState([]);

  useEffect(() => {
    axiosInstance.get("/admin/deleted-users").then((res) => setDeletedUsers(res.data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Deleted Users</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Full Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Course</th>
            <th className="border px-4 py-2">Semester</th>
            <th className="border px-4 py-2">Account Created</th>
            <th className="border px-4 py-2">Account Deleted</th>
            <th className="border px-4 py-2">Reason</th>
          </tr>
        </thead>
        <tbody>
          {deletedUsers.length > 0 ? (
            deletedUsers.map((user) => (
              <tr key={user._id} className="text-center">
                <td className="border px-4 py-2">{user.fullName}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">{user.course}</td>
                <td className="border px-4 py-2">{user.semester}</td>
                <td className="border px-4 py-2">
                  {new Date(user.createdAt).toLocaleString()}
                </td>
                <td className="border px-4 py-2">
                  {new Date(user.deletedAt).toLocaleString()}
                </td>
                <td className="border px-4 py-2">{user.deletionReason}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="border px-4 py-2 text-center">
                No deleted users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DeletedUsers;

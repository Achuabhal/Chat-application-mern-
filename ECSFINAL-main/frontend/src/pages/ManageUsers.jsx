// ManageUsers.jsx
import { useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/admin/users", {
        params: { search },
      });
      setUsers(res.data);
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const banUser = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to ban this user? This action is irreversible."
    );
    if (!confirmed) return;
    try {
      await axiosInstance.put(`/admin/ban/${userId}`);
      toast.success("User banned successfully");
      setUsers(users.filter((user) => user._id !== userId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to ban user");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Manage Users</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, course, or semester"
          className="input input-bordered w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Full Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Course</th>
            <th className="border p-2">Semester</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="text-center">
              <td className="border p-2">{user.fullName}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.course}</td>
              <td className="border p-2">{user.semester}</td>
              <td className="border p-2">
                {user.isBanned ? (
                  <span className="text-red-500 font-bold">Banned</span>
                ) : (
                  <button
                    onClick={() => banUser(user._id)}
                    className="bg-red-500 text-white px-4 py-1 rounded"
                  >
                    Ban
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;

import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, GraduationCap, Notebook } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, isUpdatingSemester, updateProfile, updateSemester, deleteAccount } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [semester, setSemester] = useState(authUser?.semester || "");
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const handleSemesterUpdate = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/auth/update-semester", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authUser.token}`,
        },
        body: JSON.stringify({ semester }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setSemester(data.semester);
      } else {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          alert(errorData.message || "Failed to update semester");
        } catch {
          alert(errorText || "An unknown error occurred");
        }
      }
    } catch (error) {
      console.error("Error updating semester:", error);
      alert("An error occurred while updating the semester.");
    }
  };

  const handleDelete = async () => {
    console.log("🚀 Delete button clicked"); // ✅ Debugging log

    if (!reason) {
        toast.error("Please select a reason for account deletion.");
        console.log("❌ No reason selected, aborting...");
        return;
    }

    try {
        console.log("🚀 Sending delete request with reason:", reason);
        await deleteAccount(reason);
        setShowModal(false);
        toast.success("Account deleted successfully.");
        console.log("✅ Account deletion completed.");
    } catch (error) {
        console.error("❌ Error deleting account:", error);
        toast.error("Failed to delete account. Please try again.");
    }
};



  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                  isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                }`}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          {/* Semester Update Section */}
          <div className="mt-6">
            <label htmlFor="semester" className="block text-sm font-medium">
              Semester
            </label>
            <select
              id="semester"
              className="w-full px-4 py-2.5 bg-base-200 rounded-lg border mt-2"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              disabled={isUpdatingSemester}
            >
              <option value="" disabled>
                Select your semester
              </option>
              {[...Array(8)].map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
            <button
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
              onClick={handleSemesterUpdate}
              disabled={isUpdatingSemester}
            >
              Update Semester
            </button>
          </div>

          {/* Course Information (Read-Only) */}
          <div className="space-y-1.5">
            <div className="text-sm text-zinc-400 flex items-center gap-2">
              <Notebook className="w-4 h-4" />
              Course
            </div>
            <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
              {authUser?.course}
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <div className="text-sm text-zinc-400 flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </div>
            <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
              {authUser?.fullName}
            </p>
          </div>

          {/* College Name */}
          <div className="space-y-1.5">
            <div className="text-sm text-zinc-400 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              College Name
            </div>
            <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
            Bangalore University
            </p>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <div className="text-sm text-zinc-400 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </div>
            <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
              {authUser?.email}
            </p>
          </div>

          {/* Delete Account Section */}
          <div className="text-center mt-6">
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Delete Account
            </button>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg">
                <h2 className="text-xl font-bold">Confirm Account Deletion</h2>
                <p className="mt-2">Select a reason for deleting your account:</p>
                <select 
  id="deletionReason"  // ✅ Added unique ID
  name="deletionReason"  // ✅ Added name attribute
  value={reason} 
  onChange={(e) => setReason(e.target.value)} 
  className="w-full mt-2 p-2 border rounded"
>
  <option value="">Select a reason</option>
  <option value="I Finished My Course">I Finished My Course</option>
  <option value="I don't want to use this app anymore">I don't want to use this app anymore</option>
</select>

                <div className="mt-4 flex justify-between">
                  <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">
                    Confirm Delete
                  </button>
                  <button onClick={() => setShowModal(false)} className="bg-gray-400 px-4 py-2 rounded">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

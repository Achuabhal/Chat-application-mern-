import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";

//import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [transparency, /* setTransparency*/ ] = useState(0.07) // Default transparency value
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "", // Add this line
    collegeName: "",
    course: "",
    semester: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const coursesByCollege = {
    "Bangalore University": ["BCA", "BBA", "BA Economics"],
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    if (formData.password !== formData.confirmPassword) return toast.error("Passwords do not match")

    if (!formData.collegeName.trim()) return toast.error("University name is required");
    if (!formData.course.trim()) return toast.error("Course is required");
    if (!formData.semester.trim()) return toast.error("Semester is required");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault()

    const success = validateForm()
    if (success === true) signup(formData)
  }

 {/*  // Function to handle transparency change
  const handleTransparencyChange = (e) => {
    setTransparency(Number.parseFloat(e.target.value))
  } */}

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/4.jpg')" }}
    >
      <div
        className="w-full max-w-4xl grid lg:grid-cols-2 rounded-xl overflow-hidden shadow-2xl"
        style={{
          backgroundColor: `rgba(255, 255, 255, ${transparency})`,
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Left side - Form */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* LOGO */}
            <div className="text-center mb-8">
              <div className="flex flex-col items-center gap-2 group">
                <div
                  className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
                group-hover:bg-primary/20 transition-colors"
                >
                  <MessageSquare className="size-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold mt-2">Create Account</h1>
                <p className="text-base-content/60">Get started with your new EC-Study account</p>
              </div>
            </div>

            {/* Transparency slider 
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium">Container Transparency</span>
                <span className="label-text-alt">{Math.round(transparency * 100)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={transparency}
                onChange={handleTransparencyChange}
                className="range range-primary"
              />
            </div>*/}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Full Name</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type="text"
                    className="input input-bordered w-full pl-10"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type="email"
                    className="input input-bordered w-full pl-10"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input input-bordered w-full pl-10"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-5 text-base-content/40" />
                    ) : (
                      <Eye className="size-5 text-base-content/40" />
                    )}
                  </button>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Confirm Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="size-5 text-base-content/40" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input input-bordered w-full pl-10"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-5 text-base-content/40" />
                    ) : (
                      <Eye className="size-5 text-base-content/40" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">University Name</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.collegeName}
                onChange={(e) => setFormData({ ...formData, collegeName: e.target.value, course: "" })}
              >
                <option value="" disabled>Select your University</option>
                {Object.keys(coursesByCollege).map((college) => (
                  <option key={college} value={college}>{college}</option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Course</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                disabled={!formData.collegeName}
              >
                <option value="" disabled>Select your course</option>
                {formData.collegeName && coursesByCollege[formData.collegeName]?.map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Semester</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              >
                <option value="" disabled>Select your semester</option>
                {[...Array(8).keys()].map((n) => (
                  <option key={n + 1} value={n + 1}>{n + 1}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

        {/* Right side - Info Panel */}
        <div className="hidden lg:flex flex-col justify-center items-center p-8 bg-primary/10">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Join our community</h2>
            <p className="text-lg">
              Connect with friends, share moments, and stay in touch with your academic community.
            </p>
            <div className="mt-8">
              <img
                src="/4.jpg?height=200&width=300"
                alt="Community illustration"
                className="mx-auto rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage;

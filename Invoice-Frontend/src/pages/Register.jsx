
import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== password2) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await axios.post("/auth/users/", { username, password, re_password: password2 });
      // Show success message briefly before redirecting
      setError("");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError("Registration failed. " + (err.response?.data?.username?.[0] || "Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter, value) => {
    setter(value);
    if (error) setError(""); // Clear error when user starts typing
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, text: "" };
    if (password.length < 6) return { strength: 1, text: "Weak", color: "text-red-500" };
    if (password.length < 10) return { strength: 2, text: "Medium", color: "text-yellow-500" };
    return { strength: 3, text: "Strong", color: "text-green-500" };
  };

  const passwordStrength = getPasswordStrength();
  const passwordsMatch = password2 && password === password2;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">Create Account</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {loading && !error && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-600" size={18} />
                <p className="text-green-600 text-sm">Registration successful! Redirecting...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => handleInputChange(setUsername, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => handleInputChange(setPassword, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && (
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        passwordStrength.strength === 1 ? 'bg-red-400 w-1/3' :
                        passwordStrength.strength === 2 ? 'bg-yellow-400 w-2/3' :
                        passwordStrength.strength === 3 ? 'bg-green-400 w-full' : 'w-0'
                      }`}
                    ></div>
                  </div>
                  <span className={`text-xs ${passwordStrength.color}`}>
                    {passwordStrength.text}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={password2}
                  onChange={(e) => handleInputChange(setPassword2, e.target.value)}
                  className={`w-full p-2 border rounded focus:ring-1 focus:ring-black transition-colors ${
                    password2 && !passwordsMatch ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password2 && (
                <div className="mt-1 flex items-center gap-2">
                  {passwordsMatch ? (
                    <>
                      <CheckCircle className="text-green-500" size={16} />
                      <span className="text-green-600 text-xs">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-red-500"></div>
                      <span className="text-red-600 text-xs">Passwords don't match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !username || !password || !password2 || !passwordsMatch || passwordStrength.strength < 2}
              className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-black hover:underline font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

function ResetPassword() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const password = watch("password", "");
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength <= 3)
      return { strength, label: "Fair", color: "bg-yellow-500" };
    if (strength <= 4) return { strength, label: "Good", color: "bg-blue-500" };
    return { strength, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data) => {
    if (!token || !email) {
      toast.error("Invalid reset link. Please request a new one.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email: email,
        token: token,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      setResetSuccess(true);
      toast.success("Password reset successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to reset password. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4 bg-gradient-to-br from-slate-50 to-teal-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={40} className="text-green-600" />
          </motion.div>

          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Password Reset Successfully!
          </h2>
          <p className="text-slate-600 mb-6">
            Your password has been updated. You can now log in with your new
            password.
          </p>

          <Link
            to="/login"
            className="block w-full bg-gradient-to-r from-cyprus to-teal-800 text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg cursor-pointer"
          >
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4 bg-gradient-to-br from-slate-50 to-teal-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-red-600" />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Invalid Reset Link
          </h2>
          <p className="text-slate-600 mb-6">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>

          <Link
            to="/forgot-password"
            className="block w-full bg-gradient-to-r from-cyprus to-teal-800 text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg"
          >
            Request New Link
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center p-4 bg-gradient-to-br from-slate-50 to-teal-50">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-cyprus to-teal-800 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold">Set New Password</h2>
          <p className="text-sm text-teal-100 mt-2">
            Choose a strong password for your account
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
                id="new-password"
                placeholder=" "
                className="peer w-full p-4 pt-6 pr-12 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
              />
              <label
                htmlFor="new-password"
                className="absolute left-4 top-2 text-slate-400 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-600 cursor-text"
              >
                New Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-5 text-slate-400 hover:text-teal-600 transition-colors cursor-pointer"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
              {errors.password && (
                <p className="text-xs text-red-500 mt-2 ml-2">
                  {errors.password.message}
                </p>
              )}
            </div>

            {password && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        level <= passwordStrength.strength
                          ? passwordStrength.color
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-600">
                  Password strength:{" "}
                  <span className="font-semibold">
                    {passwordStrength.label}
                  </span>
                </p>
              </div>
            )}

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("password_confirmation", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === watch("password") || "Passwords do not match",
                })}
                id="confirm-password"
                placeholder=" "
                className="peer w-full p-4 pt-6 pr-12 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
              />
              <label
                htmlFor="confirm-password"
                className="absolute left-4 top-2 text-slate-400 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-600 cursor-text"
              >
                Confirm New Password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-5 text-slate-400 hover:text-teal-600 transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
              {errors.password_confirmation && (
                <p className="text-xs text-red-500 mt-2 ml-2">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-700">
                Password must contain:
              </p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li className={password.length >= 8 ? "text-green-600" : ""}>
                  {password.length >= 8 ? "✓" : "○"} At least 8 characters
                </li>
                <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
                  {/[A-Z]/.test(password) ? "✓" : "○"} One uppercase letter
                </li>
                <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>
                  {/[a-z]/.test(password) ? "✓" : "○"} One lowercase letter
                </li>
                <li className={/[0-9]/.test(password) ? "text-green-600" : ""}>
                  {/[0-9]/.test(password) ? "✓" : "○"} One number
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyprus to-teal-800 text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default ResetPassword;

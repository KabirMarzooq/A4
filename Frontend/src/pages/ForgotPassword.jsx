import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const onSubmit = async (data) => {
    if (cooldown > 0) return;

    setLoading(true);
    try {
      const currentOrigin = window.location.origin;
      await api.post("/auth/forgot-password", {
        email: data.email,
        frontend_url: currentOrigin,
      });

      setEmail(data.email);
      setEmailSent(true);
      setAttempts(0);
      toast.success("Password reset link sent to your email!");
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = parseInt(
          error.response.headers["retry-after"] || 60
        );
        setCooldown(retryAfter);
        toast.error(`Too many attempts. Wait ${retryAfter} seconds.`);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 3) {
          setCooldown(60);
          toast.error("Too many attempts. Please wait 60 seconds.");
        } else {
          toast.error(
            error.response?.data?.message || "Failed to send reset link."
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex justify-center items-center p-4 bg-gradient-to-br from-slate-50 to-teal-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={40} className="text-teal-600" />
          </motion.div>

          <h2 className="text-2xl font-bold text-slate-800 mb-3">
            Check Your Email
          </h2>
          <p className="text-slate-600 mb-2">
            We've sent a password reset link to:
          </p>
          <p className="text-teal-600 font-semibold mb-6">{email}</p>

          <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left">
            <p className="text-sm text-slate-600">
              📧 <strong>Didn't receive the email?</strong>
            </p>
            <ul className="text-xs text-slate-500 mt-2 space-y-1 ml-6">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure the email address is correct</li>
              <li>• Wait a few minutes and try again</li>
            </ul>
          </div>

          <button
            onClick={() => setEmailSent(false)}
            className="w-full bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-200 transition-all mb-3 cursor-pointer"
          >
            Try Another Email
          </button>

          <Link
            to="/login"
            className="block text-sm text-teal-600 font-semibold hover:underline cursor-pointer"
          >
            ← Back to Login
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
            <Mail size={32} />
          </div>
          <h2 className="text-2xl font-bold">Forgot Password?</h2>
          <p className="text-sm text-teal-100 mt-2">
            No worries! We'll send you reset instructions.
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="relative">
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
                id="reset-email"
                placeholder=" "
                className="peer w-full p-4 pt-6 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
              />
              <label
                htmlFor="reset-email"
                className="absolute left-4 top-2 text-slate-400 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-600 cursor-text"
              >
                Email Address
              </label>
              {errors.email && (
                <p className="text-xs text-red-500 mt-2 ml-2">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full bg-gradient-to-r from-cyprus to-teal-800 text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {cooldown > 0 ? (
                `Try again in ${cooldown}s`
              ) : loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail size={20} />
                  Send Reset Link
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-teal-600 font-semibold transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;

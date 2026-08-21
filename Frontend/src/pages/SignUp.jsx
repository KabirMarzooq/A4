import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../assets/a4-icon.png";
import logoFull from "../assets/a4-logo-full.png";
import { extractErrorMessage } from "../utils/extractErrorMessage";

// Only admin registration is gated by a real secret (env ADMIN_SECRET).
// Doctor/receptionist/pharmacy/lab accounts are approved by an admin from
// the Users tab after registering instead of a self-reported, unverifiable ID.
const ID_CONFIG = {
  admin: { length: 8, label: "Admin Authorization Key", name: "adminKey" },
};

function SignUp() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showId, setShowId] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  const selectedRole = watch("role");

  const messages = [
    "Smart hospital management system",
    "Secure & compliant medical records",
    "Faster emergency response",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    if (cooldown > 0) return;

    setIsLoading(true);
    const payload = {
      name: data.username,
      email: data.email,
      phone: data.phone,
      role: data.role,
      ...(data.role === "admin" && { adminKey: data.adminKey }),
      ...(data.role === "doctor" && {
        profile: { specialization: data.specialization },
      }),
      password: data.password,
      password_confirmation: data.password,
    };

    try {
      const response = await api.post("/auth/register", payload);

      if (response.status === 201 || response.status === 200) {
        setAttempts(0);
        if (response.data?.status === "pending") {
          toast.success(
            "Registration successful! Your account is pending admin approval — you'll be able to log in once approved.",
            { duration: 6000 }
          );
        } else {
          toast.success("Registration Successful! Please login.");
        }
        navigate("/login");
      }
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = parseInt(
          error.response.headers["retry-after"] || 60
        );
        setCooldown(retryAfter);
        toast.error(
          `Too many registration attempts. Wait ${retryAfter} seconds.`
        );
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 3) {
          setCooldown(60);
          toast.error("Too many attempts. Please wait 60 seconds.");
        } else {
          const errorMsg = extractErrorMessage(
            error,
            "Registration failed. Please try again."
          );
          toast.error(errorMsg);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container min-h-screen flex justify-center items-center p-2">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2"
      >
        <div className="hidden md:flex relative flex-col justify-between text-white bg-[url('/Ui.jfif')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-br from-cyprus/70 via-teal-900/85 to-black/90 z-0"></div>

          <div className="z-10 flex flex-col items-center justify-center text-center mt-40">
            <img
              src={logo}
              alt="A4 Medical Consortium Logo"
              className="w-16 h-16 animate-bounce"
            />
            <h1 className="text-4xl font-bold tracking-wide mt-4">
              A4 Medical Consortium
            </h1>
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-cloud-white mt-3 px-10"
            >
              {messages[messageIndex]}
            </motion.p>
          </div>

          <div className="relative z-10 text-center pb-8">
            <p className="text-xs opacity-60">
              Free forever · Secure Encryption
            </p>
          </div>
        </div>

        <div className="p-8 sm:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <Link to="/" className="flex items-center mb-6">
            <img src={logoFull} alt="A4 Medical Consortium" className="h-12 w-auto" />
          </Link>

          <h2 className="text-2xl font-bold mb-1">Create account</h2>
          <p className="text-sm text-gray-500 mb-6">
            Get started absolutely free.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                id="username"
                name="name"
                {...register("username", { required: "Full name is required" })}
                placeholder=" "
                className="peer w-full p-4 pt-6 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
              />
              <label
                htmlFor="username"
                className="absolute left-4 top-2 text-gray-400 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 
               peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-600 cursor-text"
              >
                Full Name
              </label>
              {errors.username && (
                <p className="text-red-500 text-[10px] mt-1 ml-2">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                })}
                placeholder=" "
                className="peer w-full p-4 pt-6 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
              />
              <label
                htmlFor="email"
                className="absolute left-4 top-2 text-gray-400 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 
               peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-600 cursor-text"
              >
                Email Address
              </label>
              {errors.email && (
                <p className="text-red-500 text-[10px] mt-1 ml-2">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long",
                  },
                })}
                placeholder=" "
                className="peer w-full p-4 pt-6 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-2 text-gray-400 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 
               peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-600 cursor-text"
              >
                Create Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-5 text-gray-400 hover:text-teal-600 transition-colors cursor-pointer"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-[10px] mt-1 ml-2">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password_confirmation"
                {...register("password_confirmation", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === watch("password") || "Passwords do not match",
                })}
                placeholder=" "
                className="peer w-full p-4 pt-6 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
              />
              <label
                htmlFor="password_confirmation"
                className="absolute left-4 top-2 text-gray-400 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-600 cursor-text"
              >
                Confirm Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-5 text-gray-400 hover:text-teal-600 transition-colors cursor-pointer"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
              {errors.password_confirmation && (
                <p className="text-red-500 text-[10px] mt-1 ml-2">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            <div className="relative">
              <input
                type="tel"
                id="phone"
                name="phone"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{11}$/,
                    message: "Phone number must be exactly 11 digits",
                  },
                })}
                placeholder=" "
                className="peer w-full p-4 pt-6 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
              />
              <label
                htmlFor="phone"
                className="absolute left-4 top-2 text-gray-400 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 
               peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-600 cursor-text"
              >
                Phone Number
              </label>
              {errors.phone && (
                <p className="text-red-500 text-[10px] mt-1 ml-2">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="relative">
              <select
                {...register("role", { required: "Please select a role" })}
                name="role"
                className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
              >
                <option value="">Select Role</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="receptionist">Receptionist</option>
                <option value="lab">Lab</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && (
                <p className="text-red-500 text-[10px] mt-1 ml-2">
                  {errors.role.message}
                </p>
              )}
            </div>

            {(selectedRole === "admin" || selectedRole === "doctor") && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4"
              >
                {selectedRole === "admin" && (
                  <div className="relative">
                    <input
                      id="staffid"
                      name="staffid"
                      type={showId ? "text" : "password"}
                      {...register(ID_CONFIG[selectedRole].name, {
                        required: `${ID_CONFIG[selectedRole].label} is required`,
                        validate: (val) =>
                          val.length === ID_CONFIG[selectedRole].length ||
                          `ID must be exactly ${ID_CONFIG[selectedRole].length} characters long`,
                      })}
                      placeholder=" "
                      className="peer w-full p-4 pt-6 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
                    />
                    <label
                      htmlFor="staffid"
                      className="absolute left-4 top-2 text-gray-400 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400
               peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-600 cursor-text"
                    >
                      {ID_CONFIG[selectedRole].label}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowId(!showId)}
                      className="absolute right-4 top-5 text-gray-400 hover:text-teal-600 cursor-pointer"
                    >
                      {showId ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                    {errors[ID_CONFIG[selectedRole].name] && (
                      <p className="text-red-500 text-[10px] mt-1 ml-2">
                        {errors[ID_CONFIG[selectedRole].name].message}
                      </p>
                    )}
                  </div>
                )}

                {selectedRole === "doctor" && (
                  <div className="relative">
                    <input
                      type="text"
                      id="speciality"
                      name="speciality"
                      {...register("specialization", {
                        required: "Specialization is required",
                      })}
                      placeholder=" "
                      className="peer w-full p-4 pt-6 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                    />
                    <label
                      htmlFor="speciality"
                      className="absolute left-4 top-2 text-gray-400 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 
               peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-600 cursor-text"
                    >
                      Medical Specialization
                    </label>
                    {errors.specialization && (
                      <p className="text-red-500 text-[10px] mt-1 ml-2">
                        {errors.specialization.message}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="consent"
                {...register("consent", {
                  required: "You must agree to continue",
                })}
                className="mt-1 accent-teal-600 cursor-pointer"
              />
              <label htmlFor="consent" className="text-xs text-gray-500">
                By creating an account, I agree the hospital may use my
                information to provide and manage my care, and I accept the{" "}
                <Link
                  to="/terms-of-service"
                  target="_blank"
                  className="text-teal-600 font-semibold hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy-policy"
                  target="_blank"
                  className="text-teal-600 font-semibold hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </label>
            </div>
            {errors.consent && (
              <p className="text-red-500 text-[10px] -mt-2 ml-2">
                {errors.consent.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || cooldown > 0}
              className="w-full bg-gradient-to-r from-cyprus to-teal-800 text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg active:scale-95 cursor-pointer focus:outline-offset-2 focus:outline-teal-700 duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cooldown > 0
                ? `Try again in ${cooldown}s`
                : isLoading
                ? "Creating Account..."
                : "Create Account"}
            </button>

            <div className="text-center text-sm text-gray-400 mt-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-teal-600 font-bold hover:underline"
              >
                Log In
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default SignUp;

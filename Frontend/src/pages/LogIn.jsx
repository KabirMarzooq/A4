import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, } from "lucide-react";
import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import logo from "../assets/a4-icon.png";
import logoFull from "../assets/a4-logo-full.png";
import google from "../assets/google.png";
import { extractErrorMessage } from "../utils/extractErrorMessage";

function LogIn() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // cooldown is only ever set from the server's real 429 + Retry-After
  // response below — there is no client-side attempt counting here, since
  // that would just duplicate (and could drift from) the actual rate limit
  // enforced server-side in AppServiceProvider's 'login' RateLimiter.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    if (cooldown > 0) return;
    setIsLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });

      const token = response.data.access_token;
      const user = response.data.user;

      localStorage.setItem("a4_token", token);
      localStorage.setItem("a4_user", JSON.stringify(user));

      toast.success("Welcome Back!");
      navigate("/dashboard");
    } catch (error) {
      if (error.response?.status === 429) {
        // The real, server-enforced lockout (see AppServiceProvider's
        // 'login' RateLimiter) — this is the only lockout the UI shows.
        const retryAfter = parseInt(
          error.response.headers["retry-after"] || 60
        );
        setCooldown(retryAfter);
        toast.error(`Too many attempts. Locked out for ${retryAfter} seconds.`);
      } else if (error.response?.status === 403 && error.response?.data?.error) {
        // Account exists and credentials were correct — it's just pending
        // admin approval, not a wrong-password guess.
        toast.error(error.response.data.error, { duration: 6000 });
      } else {
        toast.error(
          extractErrorMessage(error, "Invalid credentials. Please try again.")
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${
      import.meta.env.VITE_API_BASE_URL
    }/auth/google/redirect`;
  };

  return (
    <div className="auth-page-container min-h-screen flex justify-center items-center p-2">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2 bg-white"
      >
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <Link to="/" className="flex items-center mb-8">
            <img src={logoFull} alt="A4 Medical Consortium" className="h-12 w-auto" />
          </Link>

          <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-6">
            Log in to continue to your dashboard.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative my-4">
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
                id="email"
                name="email"
                placeholder=" "
                className="peer w-full p-4 pt-6 border border-gray-200 rounded-2xl 
                           focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 
                           transition-all placeholder-transparent"
              />
              <label
                htmlFor="email"
                className="absolute left-4 text-gray-400 transition-all cursor-text
                           top-2 text-xs peer-placeholder-shown:top-5 peer-placeholder-shown:text-base 
                           peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal
                           peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-600"
              >
                Email Address
              </label>
              {errors.email && (
                <p className="text-[10px] text-red-500 mt-1 ml-2">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="relative my-4">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "Password is required",
                })}
                id="password"
                name="password"
                placeholder=" "
                className="peer w-full p-4 pt-6 border border-gray-200 rounded-2xl 
                           focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 
                           transition-all placeholder-transparent"
              />
              <label
                htmlFor="password"
                className="absolute left-4 text-gray-400 transition-all cursor-text
                           top-2 text-xs peer-placeholder-shown:top-5 peer-placeholder-shown:text-base 
                           peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal
                           peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-600"
              >
                Password
              </label>
              <button
                type="button"
                className="absolute right-4 top-5 text-gray-400 hover:text-teal-600 transition-all cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
              {errors.password && (
                <p className="text-[10px] text-red-500 mt-1 ml-2">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-teal-700 hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {cooldown > 0 && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                <span className="text-red-600 text-xs font-medium">
                  Account temporarily locked. Try again in {cooldown} seconds.
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || cooldown > 0}
              className="w-full bg-gradient-to-r from-cyprus to-teal-800 text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-lg active:scale-95 cursor-pointer focus:outline-offset-2 focus:outline-teal-700 duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cooldown > 0
                ? `Try again in ${cooldown}s`
                : isLoading
                ? "Logging in..."
                : "Log In"}
            </button>

            <div className="flex items-center gap-3 my-4">
              <span className="flex-1 h-px bg-gray-200"></span>

              <span className="text-xs text-gray-400">OR</span>

              <span className="flex-1 h-px bg-gray-200"></span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex-1 border border-gray-300 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-all ease-in-out duration-300 cursor-pointer"
            >
              <img src={google} alt="Google Logo" className="w-5 h-5" />

              <span className="text-sm font-medium">Google</span>
            </button>

            <Link
              to="/signup"
              className="block text-center text-sm text-gray-400 mt-6"
            >
              Don't have an account?{" "}
              <span className="text-teal-600 font-bold hover:underline">
                Register
              </span>
            </Link>
          </form>
        </div>

        <div className="hidden md:flex relative items-center justify-center text-white bg-[url('/Ui.jfif')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-br from-cyprus/70 via-teal-900/85 to-black/90" />
          <div className="relative z-10 text-center px-8 flex flex-col h-full justify-between py-12">
            <div className="animate-float mt-20">
              <img
                src={logo}
                alt="A4 Medical Consortium Logo"
                className="w-15 h-15 mx-auto mb-4 animate-pulse"
              />
              <h1 className="text-2xl font-semibold tracking-wide">
                A4 Medical Consortium
              </h1>
            </div>
            <div>
              <p className="text-sm opacity-90 font-light">
                Smart hospital management system
              </p>
              <p className="text-[10px] opacity-60 mt-2 uppercase tracking-tighter">
                Secure · Scalable · Life-critical
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default LogIn;

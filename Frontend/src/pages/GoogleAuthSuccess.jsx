import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function GoogleAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const user = searchParams.get("user");
    const error = searchParams.get("error");

    if (error === "no_account") {
      toast.error(
        "No account found with this Google email. Please register first."
      );
      navigate("/login");
      return;
    }

    if (error === "google_failed") {
      toast.error("Google login failed. Please try again.");
      navigate("/login");
      return;
    }

    if (error === "pending_approval") {
      toast.error(
        "Your account is pending admin approval. You'll be able to log in once approved.",
        { duration: 6000 }
      );
      navigate("/login");
      return;
    }

    if (token && user) {
      localStorage.setItem("a4_token", token);
      localStorage.setItem("a4_user", user);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500 animate-pulse">
        Signing you in with Google...
      </p>
    </div>
  );
}

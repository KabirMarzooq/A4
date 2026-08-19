import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  User,
  ClipboardList,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const COMMON_REASONS = [
  "Regular Checkup",
  "Blood Pressure Test",
  "Vaccination",
  "Symptom Discussion",
  "Follow-up",
  "Emergency Consultation",
  "Prescription Renewal",
];

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    reason: "",
    additional_notes: "",
  });

  useEffect(() => {
    setLoading(true);
    const fetchDoctors = async () => {
      try {
        const response = await api.get("/doctors");
        setDoctors(response.data);
      } catch (err) {
        if (err.response?.status === 403) {
          console.error(
            "Access Denied: Your user role might not have permission.",
          );
        }
        console.error("Failed to fetch doctors", err);
        toast.error("Failed to fetch doctors");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.doctor_id ||
      !formData.appointment_date ||
      !formData.appointment_time ||
      !formData.reason
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post("/appointments", formData);

      toast.success("Appointment booked successfully!");
      navigate("/dashboard/my-appointments");

      setFormData({
        doctor_id: "",
        appointment_date: "",
        appointment_time: "",
        reason: "",
        additional_notes: "",
      });
    } catch (err) {
      if (err.response && err.response.status === 409) {
        toast.error("Double Booking Error: " + err.response.data.message);
      } else {
        toast.error(
          "Booking Failed: Please check your connection or try again.",
        );
      }
      console.error("Booking error details:", err.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-teal-600" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          Book Appointment
        </h1>
        <p className="text-gray-500">
          Select your preferred doctor and schedule your visit.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 text-cyprus dark:text-teal-400 font-semibold">
            <User size={20} />
            <h2>Choose a Specialist</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doc) => (
              <label
                key={doc.id}
                className={`relative flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ease-in-out duration-300 ${
                  formData.doctor_id === doc.id
                    ? "border-teal-500 bg-teal-50/50 dark:bg-teal-900/10"
                    : "border-gray-100 dark:border-slate-800 hover:border-teal-200"
                }`}
              >
                <input
                  type="radio"
                  name="doctor"
                  className="hidden"
                  onChange={() =>
                    setFormData({ ...formData, doctor_id: doc.id })
                  }
                />
                <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold mr-4">
                  {doc.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">
                    Dr. {doc.name}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {doc.specialization}
                  </p>
                </div>
                {formData.doctor_id === doc.id && (
                  <CheckCircle2
                    className="absolute right-4 text-teal-500"
                    size={20}
                  />
                )}
              </label>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4 text-cyprus dark:text-teal-400 font-semibold">
              <Calendar size={20} />
              <h2>Date & Time</h2>
            </div>
            <input
              type="date"
              className="w-full p-3 rounded-xl dark:text-white text-slate-900 bg-gray-50 dark:bg-slate-800 border-none mb-4 outline-none focus:ring-2 focus:ring-teal-500 dark:[color-scheme:dark]"
              onChange={(e) =>
                setFormData({ ...formData, appointment_date: e.target.value })
              }
            />
            <input
              type="time"
              className="w-full p-3 rounded-xl dark:text-white text-slate-900 bg-gray-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-teal-500 dark:[color-scheme:dark]"
              onChange={(e) =>
                setFormData({ ...formData, appointment_time: e.target.value })
              }
            />
          </section>

          <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4 text-cyprus dark:text-teal-400 font-semibold">
              <ClipboardList size={20} />
              <h2>Reason for Visit</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {COMMON_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      reason: formData.reason === reason ? "" : reason,
                    })
                  }
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    formData.reason === reason
                      ? "bg-cyprus text-white shadow-md scale-105"
                      : "bg-teal-500/10 text-teal-700 dark:text-teal-300 hover:bg-teal-500/20"
                  }`}
                >
                  {reason}

                  {formData.reason === reason && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="ml-1 bg-white/20 rounded-full p-0.5 hover:bg-white/40"
                    >
                      <X size={12} />
                    </motion.span>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 italic">
                Optional: Describe your symptoms in detail
              </label>
              <textarea
                placeholder="Ex: I've been feeling dizzy for two days..."
                value={formData.additional_notes}
                onChange={(e) =>
                  setFormData({ ...formData, additional_notes: e.target.value })
                }
                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-teal-500 outline-none transition-all min-h-[120px] text-sm dark:text-white"
              />
            </div>
          </section>
        </div>

        <p className="text-xs text-gray-500 text-center">
          By booking, you agree the hospital may contact you regarding your
          appointment or care. See our{" "}
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noreferrer"
            className="text-teal-600 font-semibold hover:underline"
          >
            Privacy Policy
          </a>
          .
        </p>

        <button
          disabled={submitting}
          className="w-full bg-cyprus text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-teal-900 transition-all flex justify-center cursor-pointer items-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Confirm Appointment"
          )}
        </button>
      </form>
    </div>
  );
}

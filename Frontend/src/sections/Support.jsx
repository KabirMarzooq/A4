import React, { useState } from "react";
import {
  AlertTriangle,
  MessageCircle,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Bug,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BugReportModal from "../components/BugReportModal";

const Support = () => {
  const navigate = useNavigate();
  // State to handle which FAQ is open
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I cancel or reschedule an appointment?",
      answer:
        "You can manage your appointments from the 'My Appointments' tab. Click 'View Details' on any pending or confirmed appointment to see options for cancelling or choosing a new date.",
    },
    {
      question: "Is my medical data secure?",
      answer:
        "Yes. A4 Medical Consortium uses end-to-end encryption and complies with standard healthcare data privacy regulations. Your medical records are only accessible to you and your authorized healthcare providers.",
    },
    {
      question: "How do I reset my password?",
      answer:
        "If you are logged out, click 'Forgot Password' on the login screen. If you are logged in, navigate to 'Settings' > 'Security' to update your password.",
    },
  ];

  return (
    <div className="p-4 md:p-8 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 rounded-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Help & Support
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          How can we assist you today?
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 shadow-sm">
          <div className="text-red-600 dark:text-red-500 mt-1 flex-shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-red-800 dark:text-red-400 font-bold uppercase tracking-wide text-sm mb-1">
              Medical Emergency Disclaimer
            </h3>
            <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">
              If you are experiencing a medical emergency, please call{" "}
              <span className="font-bold">122</span> or go to the nearest
              emergency room immediately. This support channel is for technical
              issues and general inquiries only.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.open("https://wa.me/2349064769973", "_blank")}
            className="flex flex-col items-center text-center p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 transition-all group cursor-pointer shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4 group-hover:scale-110 transition-transform">
              <MessageCircle size={24} />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">
              Chat on WhatsApp
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Message our team directly.
            </p>
          </button>

          <a
            href="mailto:a4consortium@gmail.com"
            className="flex flex-col items-center text-center p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 transition-all group shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4 group-hover:scale-110 transition-transform">
              <Mail size={24} />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">
              Email Support
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              a4consortium@gmail.com
            </p>
          </a>

          <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4">
              <Phone size={24} />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">
              Call Us
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              0906 476 9973
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Mon-Sun, 8am - 5pm
            </p>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {faq.question}
                  </span>
                  <div className="text-slate-400 dark:text-slate-500 flex-shrink-0 ml-4">
                    {openFaqIndex === index ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                </button>

                {openFaqIndex === index && (
                  <div className="px-5 pb-5 pt-1 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700/50 mt-2">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-center">
          <button
            onClick={() => setIsBugModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm transition-colors cursor-pointer"
          >
            <Bug size={16} />
            Report a technical issue or bug
          </button>
        </div>
      </div>

      <BugReportModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
      />
    </div>
  );
};

export default Support;

import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../services/api";
import { extractErrorMessage } from "../utils/extractErrorMessage";
import { MapPin, MailOpen, Phone, Clock, Send } from "lucide-react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post("/contact", formData);
      toast.success(
        response.data.message || "Thanks for reaching out! We'll get back to you shortly."
      );
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to send your message. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const contacts = [
    {
      icon: MapPin,
      contact: "Our Location",
      location: "No 6b Jsq Niwa Quarters, Marine Road, Beside Elite Hotel, Adankolo, Lokoja, Kogi State",
    },
    {
      icon: MailOpen,
      contact: "Email Us",
      location: "a4consortium@gmail.com",
    },
    {
      icon: Phone,
      contact: "Call Us",
      location: "0906 476 9973",
    },
    {
      icon: Clock,
      contact: "Working Hours",
      location: "Mon–Sun: 8:00am–5:00pm",
    },
  ];

  const icons = [
    "fa-brands fa-facebook",
    "fa-brands fa-x-twitter",
    "fa-brands fa-instagram",
    "fa-brands fa-linkedin",
  ];

  return (
    <div className="m-2">
      <div className="absolute left-0 top-0 w-full h-full bg-white pt-50 dark:bg-gray-900 -z-10"></div>

      <h2 className="text-center text-cyprus text-5xl font-bold dark:text-cloud-white">
        Contact
      </h2>

      <p className="text-black opacity-65 dark:text-white text-lg text-center my-5">
        We are here to provide you with fast, accurate, and reliable medical services. 
        Reach out to us today for appointments, <br className="hidden sm:inline-block" />{" "}
        inquiries, or general health support.
      </p>

      <div className="w-full flex flex-col sm:flex-row my-15 gap-8 pt-10 items-start">
        <div className="flex flex-col w-full sm:w-2/5 sm:ml-10 bg-linear-to-r from-teal-800 to-cyprus dark:bg-linear-to-r dark:from-gray-800/75 dark:to-gray-900 shadow-sm dark:shadow-gray-200/20 shadow-gray-900/20 p-10 rounded-3xl">
          <h2 className="text-cloud-white sm:text-4xl sm:font-bold text-3xl">
            Contact Information
          </h2>

          <p className="text-cloud-white text-sm my-5">
            We are conveniently located for easy access to provide you with 
            express medical care.
          </p>

          <div>
            {contacts.map((item, index) => (
              <div
                key={index}
                className="flex items-center bg-linear-to-r from-cyprus/20 to-teal-800/20 dark:bg-linear-to-r dark:from-gray-900/20 dark:to-gray-800/20 text-cloud-white rounded-xl p-5 my-8 hover:-translate-y-2 hover:brightness-125 transition-all ease-in-out duration-300"
              >
                <item.icon
                  size={24}
                  className="text-cloud-white text-center p-3 rounded-full bg-teal-600 mr-4 box-content"
                />
                <div>
                  <p>{item.contact}</p>
                  <small className="text-sm">{item.location}</small>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-50">
            <h2 className="text-cloud-white text-[18px] font-medium dark:text-teal-600">
              Follow Us
            </h2>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 50 },
                show: {
                  opacity: 1,
                  y: 0,
                },
              }}
              initial="hidden"
              whileInView="show"
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="my-3"
            >
              {icons.map((icons) => (
                <span key={icons} className="relative inline-block group mr-3 last:mr-0">
                  <i
                    className={`${icons} text-cloud-white !inline-flex !items-center !justify-center !w-10 !h-10 rounded-full bg-teal-600/50 !text-base !leading-none cursor-not-allowed opacity-70 transition-all ease-in-out duration-300`}
                  ></i>
                  <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Coming soon
                  </span>
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="flex flex-col gap-8 sm:w-3/5 w-full">
          <motion.iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.9203099305796!2d6.7418774743679295!3d7.798261807039828!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104f5fd354c2cded%3A0x530e1b16de25debb!2sA4%20Medical%20Consortium!5e0!3m2!1sen!2sng!4v1786927984231!5m2!1sen!2sng"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            variants={{
              hidden: { opacity: 0, y: 150 },
              show: {
                opacity: 1,
                y: 0,
              },
            }}
            initial="hidden"
            whileInView="show"
            transition={{ duration: 2, ease: "easeOut" }}
            viewport={{ once: true }}
            className="rounded-2xl w-full max-w-[800px] h-[300px]"
          ></motion.iframe>

          <form
            onSubmit={handleSubmit}
            className="bg-cloud-white dark:bg-gray-950/5 p-10 dark:shadow-md dark:shadow-gray-800/20 shadow-sm shadow-gray-900/20 rounded-2xl"
          >
            <h2 className="text-cyprus text-[28px] font-medium dark:text-cloud-white">
              Send Us a Message
            </h2>

            <p className="text-gray-800/20 dark:text-cloud-white text-sm my-5">
              For any major complaints, improvemnts or questions reach out to us.
            </p>

            <div className="relative my-4">
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="border dark:border-white border-gray-800/20 caret-teal-700
                w-full p-5 rounded-2xl text-cloud-white focus:outline-none
                 focus:border-teal-700 peer placeholder-transparent focus:shadow-md focus:shadow-teal-700/20"
              />
              <label
                htmlFor="name"
                className="absolute left-5 top-1 text-gray-600 
                text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                peer-placeholder-shown:top-5 transition-all peer-focus:top-1
                 peer-focus:text-gray-600 peer-focus:text-sm"
              >
                Full Name
              </label>
            </div>

            <div className="relative my-4">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="border dark:border-white border-gray-800/20 caret-teal-700
                w-full p-5 rounded-2xl text-cloud-white focus:outline-none
                 focus:border-teal-700 peer placeholder-transparent focus:shadow-md focus:shadow-teal-700/20"
              />
              <label
                htmlFor="email"
                className="absolute left-5 top-1 text-gray-600 
                text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                peer-placeholder-shown:top-5 transition-all peer-focus:top-1
                 peer-focus:text-gray-600 peer-focus:text-sm"
              >
                Email Address
              </label>
            </div>

            <div className="relative my-4">
              <input
                type="text"
                id="subject"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="border dark:border-white border-gray-800/20 caret-teal-700
                w-full p-5 rounded-2xl text-cloud-white focus:outline-none
                 focus:border-teal-700 peer placeholder-transparent focus:shadow-md focus:shadow-teal-700/20"
              />
              <label
                htmlFor="subject"
                className="absolute left-5 top-1 text-gray-600 
                text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                peer-placeholder-shown:top-5 transition-all peer-focus:top-1
                 peer-focus:text-gray-600 peer-focus:text-sm"
              >
                Subject
              </label>
            </div>

            <div className="relative my-4">
              <textarea
                name="message"
                id="area"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
                className="border dark:border-white border-gray-800/20 caret-teal-700
                w-full p-5 rounded-2xl text-cloud-white focus:outline-none
                 focus:border-teal-700 peer placeholder-transparent h-48 focus:shadow-md focus:shadow-teal-700/20"
              ></textarea>
              <label
                htmlFor="area"
                className="absolute left-5 top-1 text-gray-600 
                text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                peer-placeholder-shown:top-5 transition-all peer-focus:top-1
                 peer-focus:text-gray-600 peer-focus:text-sm"
              >
                Your Message
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-teal-700 text-cloud-white font-bold text-lg group hover:shadow-lg hover:shadow-teal-700/20 p-3 rounded-xl transition-all ease-in-out duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Message"}{" "}
              {!isSubmitting && (
                <Send
                  size={16}
                  className="inline ml-1 group-hover:translate-x-1 transition-all ease-in-out duration-300"
                />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Contact;

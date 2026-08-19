import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  Phone,
  MapPin,
  CalendarCheck,
} from "lucide-react";

const childVariant = {
  hidden: { opacity: 0, y: 150 },
  show: { opacity: 1, y: 0 },
};

export function FeaturedCards({ icon: Icon, features, description, items }) {
  return (
    <motion.div
      variants={childVariant}
      className="bg-white border-t-4 border-cyprus rounded-3xl flex flex-col p-5 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all ease-in duration-200"
    >
      <div className="py-5">
        <Icon
          size={40}
          className="text-cyprus bg-teal-100 p-4 rounded-full box-content"
        />
      </div>

      <p className="font-semibold text-2xl text-cyprus">{features}</p>

      <small className="text-sm text-black opacity-65 my-7 leading-6">
        {description}
      </small>

      <ul>
        {items.map((item, index) => (
          <li
            key={index}
            className="text-sm text-gray-700 leading-8 flex items-center"
          >
            <CheckCircle2 size={16} className="text-cyprus mr-2 shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      <Link
        to="/services"
        className="text-teal-600 font-semibold group/link hover:text-cyprus transition-all ease-in duration-200 w-28 my-4 flex items-center gap-1"
      >
        Learn More{" "}
        <ArrowRight
          size={14}
          className="group-hover/link:translate-x-2 transition-all ease-in duration-200"
        />
      </Link>
    </motion.div>
  );
}

export function ServicesCards({
  icon: Icon,
  title,
  description,
  to = "/",
  link,
}) {
  return (
    <motion.div
      variants={childVariant}
      className="bg-white shadow-lg flex flex-col items-center rounded-xl p-5 group/cad hover:shadow-2xl hover:-translate-y-2 transition-all ease-in duration-300 dark:shadow-white dark:shadow-sm dark:hover:shadow-md"
    >
      <div className="py-5">
        <Icon
          size={36}
          className="text-cyprus group-hover/cad:bg-cyprus group-hover/cad:text-cloud-white transition-all ease-in duration-300 bg-teal-100 p-5 rounded-full box-content"
        />
      </div>

      <p className="text-cyprus font-mono text-xl py-2 font-medium">{title}</p>

      <small className="text-[16px] text-center text-black opacity-75 py-2">
        {description}
      </small>

      <Link
        to={to}
        className="text-teal-600 font-semibold group/link hover:text-cyprus transition-all ease-in duration-200 my-4 flex items-center gap-1"
      >
        {link}{" "}
        <ArrowRight
          size={14}
          className="group-hover/link:translate-x-2 transition-all ease-in duration-200"
        />
      </Link>
    </motion.div>
  );
}

export function ServiceCards({
  icon: Icon,
  features,
  description,
  items,
  to = "/services",
  className = "",
}) {
  return (
    <Link to={to}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 100 },
          show: {
            opacity: 1,
            y: 0,
          },
        }}
        initial="hidden"
        whileInView="show"
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewport={{ once: true }}
        className={`bg-white dark:bg-gray-900 border-0 hover:border hover:border-cyprus rounded-3xl flex flex-col p-5 shadow-sm group/cad dark:shadow-gray-200/20 hover:shadow-lg hover:-translate-y-3 transition-all ease-in-out duration-200 ${className}`}
      >
        <div className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-teal-100 my-5">
          <span
            className="
      absolute inset-0 rounded-xl bg-cyprus 
      scale-0 group-hover/cad:scale-100 
      transition-all duration-300 ease-in-out
    "
          ></span>

          <Icon
            size={24}
            className="relative z-10 text-cyprus group-hover/cad:text-cloud-white"
          />
        </div>

        <p className="font-semibold text-2xl text-cyprus dark:text-teal-700">
          {features}
        </p>

        <small className="text-sm text-black opacity-65 my-7 leading-6 dark:text-white">
          {description}
        </small>

        <ul>
          {items.map((item, index) => (
            <li
              key={index}
              className="text-sm text-gray-700 leading-8 flex items-center dark:text-cloud-white"
            >
              <CheckCircle2
                size={16}
                className="text-cyprus mr-2 shrink-0 dark:text-teal-700"
              />
              {item}
            </li>
          ))}
        </ul>

        <span className="text-teal-600 font-semibold hover:text-cyprus dark:hover:text-teal-700 transition-all ease-in duration-200 w-28 my-4 flex items-center gap-1">
          Learn More{" "}
          <ArrowRight
            size={14}
            className="group-hover/cad:translate-x-2 transition-all ease-in duration-200"
          />
        </span>
      </motion.div>
    </Link>
  );
}

export function EmergencyCards({
  icon: Icon,
  features,
  description,
  items,
  to = "/contact",
}) {
  return (
    <Link to={to}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 300 },
          show: {
            opacity: 1,
            y: 0,
          },
        }}
        initial="hidden"
        whileInView="show"
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewport={{ once: true }}
        className="w-full sm:w-5/6 mx-auto items-center text-center p-3 sm:p-10 bg-white dark:bg-gray-900 border-2 border-cyprus rounded-3xl flex flex-col shadow-sm group/cad dark:shadow-gray-200/20 hover:shadow-lg hover:-translate-y-3 transition-all ease-in-out duration-200 mb-15"
      >
        <div className="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-teal-100 my-5">
          <span
            className="
      absolute inset-0 rounded-xl bg-cyprus 
      scale-0 group-hover/cad:scale-100 
      transition-all duration-300 ease-in-out
    "
          ></span>

          <Icon
            size={24}
            className="relative z-10 text-cyprus group-hover/cad:text-cloud-white"
          />
        </div>

        <p className="font-semibold text-2xl text-cyprus dark:text-teal-700 font-mono">
          {features}
        </p>

        <small className="text-base text-black opacity-65 my-7 leading-6 dark:text-white">
          {description}
        </small>

        <div className="w-full">
          <ul className="text-left">
            {items.map((item, index) => (
              <li
                key={index}
                className="text-sm text-gray-700 leading-8 flex items-center dark:text-cloud-white"
              >
                <CheckCircle2
                  size={16}
                  className="text-cyprus mr-2 shrink-0 dark:text-teal-700"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-5 mt-5">
          <Link to="/contact">
            <button className="font-bold inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 hover:-translate-y-2 transition-all ease-in-out duration-300 rounded-full py-4 px-7 text-cloud-white cursor-pointer">
              <Phone size={16} className="text-cloud-white" /> Call
              Emergency
            </button>
          </Link>

          <Link to="/contact">
            <button className="font-bold inline-flex items-center gap-2 border-2 border-cyprus hover:text-cloud-white group/button hover:bg-cyprus hover:-translate-y-2 transition-all ease-in-out duration-300 rounded-full py-4 px-7 text-cyprus cursor-pointer">
              <MapPin
                size={16}
                className="text-cyprus group-hover/button:text-cloud-white"
              />{" "}
              Get Directions
            </button>
          </Link>
        </div>
      </motion.div>
    </Link>
  );
}

export function ScheduleCards() {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -150, y: 50 },
        show: {
          opacity: 1,
          x: 0,
          y: 0,
        },
      }}
      initial="hidden"
      whileInView="show"
      transition={{ duration: 0.5, ease: "easeOut" }}
      viewport={{ once: true }}
      className="sm:w-1/2 w-full mx-auto shadow-sm dark:shadow-gray-200/20 shadow-gray-900/20 flex flex-col items-center justify-center text-center my-15 p-10 rounded-3xl bg-cloud-white dark:bg-gray-900"
    >
      <CalendarCheck
        size={48}
        className="text-cyprus dark:text-teal-700 py-5"
      />

      <p className="font-semibold text-3xl text-cyprus dark:text-teal-700 font-mono">
        Ready to Schedule Your Appointment?
      </p>

      <small className="text-base text-black opacity-65 my-5 leading-6 dark:text-white">
        We provide prompt, professional medical attention tailored to your 
        specific health needs, whether in-person or remotely. Reliable 
        Medical Care for You and Your Family.
      </small>

      <div className="flex gap-5 mt-5">
        <Link to="/login">
          <button className="font-bold inline-block bg-cyprus hover:bg-transparent border-2 border-cyprus hover:text-cyprus hover:-translate-y-1 transition-all ease-in-out duration-300 rounded-full py-4 px-7 text-cloud-white cursor-pointer">
            Book Now
          </button>
        </Link>

        <Link to="/contact">
          <button className="font-bold inline-block border-2 border-gray-700/20 hover:border-gray-800 hover:text-cloud-white group/button hover:bg-gray-800 hover:-translate-y-1 transition-all ease-in-out duration-300 rounded-full py-4 px-7 text-cyprus cursor-pointer">
            Contact Us
          </button>
        </Link>
      </div>
    </motion.div>
  );
}

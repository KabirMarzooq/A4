import { motion } from "framer-motion";
import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/a4-logo-full.png";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="bg-teal-50 sm:px-30 flex flex-col px-10">
        <hr className="text-gray-200" />

        <div className="pt-30 sm:grid grid-cols-3 gap-8 flex flex-col">
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 150 },
              show: {
                opacity: 1,
                y: 0,
              },
            }}
            initial="hidden"
            whileInView="show"
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <Link
              to="/"
              className="text-cyprus text-2xl flex items-center group w-50"
            >
              <img
                src={logo}
                alt="A4 Medical Consortium"
                className="h-12 w-auto"
              />
            </Link>

            <p className="text-cyprus text-sm font-mono mt-5">
              <span className="font-semibold">Address: </span>
              <br />
              No 6b Jsq Niwa Quarters, Marine Road, <br />Beside Elite Hotel, Adankolo, <br />Lokoja, Kogi State
            </p>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 150 },
              show: {
                opacity: 1,
                y: 0,
              },
            }}
            initial="hidden"
            whileInView="show"
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="flex flex-col justify-end"
          >
            <p className="leading-8 text-cyprus text-sm font-mono">
              <span className="font-semibold">Phone:</span> 0906 476 9973
              <br />
              <span className="font-semibold">Email:</span> a4consortium@gmail.com
              <br />
              <span className="font-semibold">Hours:</span> Mon–Sun 8:00am–5:00pm
              <br />
            </p>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 150 },
              show: {
                opacity: 1,
                y: 0,
              },
            }}
            initial="hidden"
            whileInView="show"
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            {["fa-facebook", "fa-instagram", "fa-x-twitter", "fa-linkedin-in"].map((icon) => (
              <span key={icon} className="relative inline-block group mr-2 last:mr-0">
                <i
                  className={`fa-brands ${icon} !inline-flex !items-center !justify-center !w-10 !h-10 !text-base !leading-none text-gray-400 border-1 border-gray-400 rounded-full cursor-not-allowed opacity-60 transition-all ease-in duration-200`}
                ></i>
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Coming soon
                </span>
              </span>
            ))}
          </motion.div>
        </div>

        <motion.hr
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
          className="text-gray-200 my-5"
        />

        <motion.div
          variants={{
            hidden: { opacity: 0, y: -150 },
            show: {
              opacity: 1,
              y: 0,
            },
          }}
          initial="hidden"
          whileInView="show"
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center text-cyprus py-3"
        >
          <small className="text-base">
            &copy; {currentYear} A4 Medical Consortium Hospital Management
            System. All Rights Reserved.
          </small>
          <div className="text-sm mt-2">
            <Link to="/privacy-policy" className="hover:underline">
              Privacy Policy
            </Link>
            <span className="mx-2 opacity-50">&middot;</span>
            <Link to="/terms-of-service" className="hover:underline">
              Terms of Service
            </Link>
          </div>
        </motion.div>
      </footer>
    </>
  );
}

export default Footer;

import { NavLink, Link } from "react-router-dom";
import { Button } from "./Button.jsx";
import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import React from "react";
import logo from "../assets/a4-icon.png";

function Navbar() {
  const getActiveClass = ({ isActive }) =>
    `${
      isActive
        ? "active text-cyprus font-bold dark:text-cloud-white "
        : "hover:text-cyprus dark:text-cloud-white hover:dark:text-cloud-white"
    } relative nav-link`;

  const { scrollY } = useScroll();

  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <div className=" mb-40 mx-auto w-5/6">
      <motion.div
        variants={{
          visible: { y: 0, scaleX: 1, opacity: 1 },
          hidden: { y: "-100%", scaleX: 0.8, opacity: 0 },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="bg-cloud-white w-5/6 rounded-full fixed mt-5 sm:py-2 sm:px-8 z-20 flex justify-between items-center drop-shadow-xl origin-center
        dark:bg-gray-950 dark:drop-shadow-cloud-white/50 dark:drop-shadow-xl py-3"
      >
        <div>
          <Link
            to="/"
            className="text-cyprus dark:text-cloud-white hidden sm:flex items-center"
          >
            <img
              src={logo}
              alt="A4 Medical Consortium Logo"
              className="w-10 h-10 mx-auto"
            />
            <p className="italic font-logo text-xl py-0.5">A4 Medical Consortium</p>
          </Link>
        </div>

        <nav className="flex gap-6">
          <NavLink to="/" className={getActiveClass}>
            Home
          </NavLink>
          <NavLink to="/about" className={getActiveClass}>
            About
          </NavLink>
          <NavLink to="/services" className={getActiveClass}>
            Services
          </NavLink>
          <NavLink to="/contact" className={getActiveClass}>
            Contact
          </NavLink>
        </nav>

        <Button text="Appointment" to="/login" />
      </motion.div>
    </div>
  );
}

export default Navbar;

// https://bootstrapmade.com/demo/MediTrust/
// https://www.creative-tim.com/twcomponents/cheatsheet

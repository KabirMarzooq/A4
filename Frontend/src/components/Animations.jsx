import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function AnimatedSection({
  children,
  direction = "left",
  className = "",
  duration = 1,
  once = true,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once });

  const offset = {
    left: { x: -100, y: 0 },
    right: { x: 100, y: 0 },
    top: { x: 0, y: -100 },
    bottom: { x: 0, y: 100 },
  }[direction] || { x: 0, y: 0 };

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, ...offset }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, ...offset }
      }
      transition={{ duration, ease: "easeOut" }}
      className={`max-w-screen-xl px-5 sm:w-xl md:mx-20 my-20 ${className}`}
    >
      {children}
    </motion.section>
  );
}

export default AnimatedSection;

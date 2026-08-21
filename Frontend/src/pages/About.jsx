import { Button, ButtonB } from "../components/Button.jsx";
import { motion } from "framer-motion";
import BrandPanel from "../assets/a4-brand-panel.jpg";
import Isometric from "../assets/a4-endoscopy-service.png";
import Cones from "../assets/a4-building.png";
import Badge from "../assets/a4-logo-badge.png";
import Counter from "../components/Counter";

function About() {
  return (
    <div>
      <div className="absolute left-0 top-0 w-full h-full bg-white pt-50 dark:bg-gray-900 -z-10"></div>

      <h2 className="text-center text-cyprus text-5xl font-bold dark:text-cloud-white">
        About
      </h2>

      <p className="text-black opacity-65 dark:text-white text-lg text-center my-5">
        Our goal is to consistently improve community health by making expert
        medical care accessible and <br className="hidden sm:inline-block" />{" "}
        straightforward for everyone.
      </p>

      <div className="flex flex-col-reverse sm:flex-row mx-auto w-9/10 sm:w-5/6 gap-10 mt-20 m-5 overflow-hidden">
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
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="sm:w-1/2 w-full"
        >
          <h2 className="text-cyprus text-4xl font-bold dark:text-cloud-white leading-tight">
            Committed to Excellence in Healthcare
          </h2>

          <p className="text-black opacity-65 dark:text-white text-lg my-6 leading-7">
            Welcome to A4 Medical Consortium, where quality healthcare meets
            true professionalism. We are deeply committed to providing
            affordable, reliable, and accessible medical care to individuals and
            families in our community. Whether you need a routine check-up,
            urgent care, or specialized testing, our doors are open to help you
            get well now.
          </p>

          <p className="text-black opacity-65 dark:text-white text-lg my-6 leading-7">
            We understand that when it comes to your health, time is of the
            essence. We recognize the critical importance of quick, accurate
            diagnoses and proper treatment. At A4 Medical Consortium, we ensure that every
            patient receives timely attention, accurate results, and the
            personalized, compassionate care they deserve.
          </p>

          <motion.div
            variants={{
              hidden: { opacity: 0, y: 150 },
              show: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            whileInView="show"
            transition={{ duration: 0.4, ease: "easeOut" }}
            viewport={{ once: true }}
            className="p-4 rounded-xl h-40 shadow-sm shadow-gray-600 dark:shadow-gray-200/20 flex justify-around items-center"
          >
            <h1 className="text-4xl dark:text-cloud-white text-cyprus text-center font-bold">
              <Counter end={11} />+
              <p className="text-black opacity-65 dark:text-white my-3 text-lg">
                Years of Experience
              </p>
            </h1>

            <h1 className="text-4xl dark:text-cloud-white text-cyprus text-center font-bold">
              <Counter end={8000} />+
              <p className="text-black opacity-65 dark:text-white my-3 text-lg">
                Patients Treated
              </p>
            </h1>
          </motion.div>

          <div className="my-9 hidden sm:flex gap-5">
            <Button
              text="Meet Our Doctors"
              to="/about"
              className="py-4 px-7 inline-block font-bold hover:-translate-y-1 transition-all ease-in-out duration-200"
            />

            <ButtonB
              text="View Our Services"
              to="/services"
              className="inline-block text-cyprus hover:text-cloud-white hover:border-teal-800 dark:text-cloud-white dark:border-teal-700 hover:-translate-y-1 transition-all ease-in-out duration-200"
            />
          </div>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, x: 150, y: 50 },
            show: { opacity: 1, x: 0, y: 0 },
          }}
          initial="hidden"
          whileInView="show"
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="sm:w-1/2 w-full flex flex-col gap-5"
        >
          <div className="relative">
            <img
              loading="lazy"
              src={Cones}
              alt="A4 Medical Consortium hospital building"
              className="aspect-[3/2] w-full object-cover rounded-2xl shadow-md shadow-gray-200"
            />
            <img
              loading="lazy"
              src={Badge}
              alt="A4 Medical Consortium"
              className="hidden sm:block absolute -bottom-6 -right-6 w-28 h-auto drop-shadow-lg bg-white rounded-xl p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <img
              loading="lazy"
              src={Isometric}
              alt="A4 Medical Consortium endoscopy service"
              className="aspect-[4/3] w-full object-cover rounded-2xl shadow-md shadow-gray-200"
            />
            <img
              loading="lazy"
              src={BrandPanel}
              alt="A4 Medical Consortium"
              className="aspect-[4/3] w-full object-cover rounded-2xl shadow-md shadow-gray-200"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default About;

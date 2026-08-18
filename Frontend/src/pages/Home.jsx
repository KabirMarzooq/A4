import { Button, ButtonB, ButtonC } from "../components/Button.jsx";
import { motion } from "framer-motion";
import Hospital from "../assets/a4-building.png";
import { FeaturedCards, ServicesCards } from "../components/Cards.jsx";

const parentVariant = {
  hidden: { opacity: 0, y: 50 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.2,
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const childVariant = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

function Home() {
  const services = [
    {
      icon: "fa-solid fa-hand-dots",
      title: "Dermatology",
      text: "We offer diagnosis and treatment of various skin, hair, and nail conditions.",
    },
    {
      icon: "fa-solid fa-person-pregnant",
      title: "Gynaecology",
      text: "Comprehensive pregnancy care, scanning and delivery.",
    },
    {
      icon: "fa-solid fa-capsules",
      title: "Diagnostics",
      text: "We offer laboratory testing, and specialized screenings for optimal patient care.",
    },
  ];

  return (
    <>
      <div>
        <section className="w-full px-5 md:px-20 max-w-screen-xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-15 items-center justify-between">
            <div className="flex-1 min-w-0">
              <motion.p
                variants={{
                  hidden: { opacity: 0, x: -100, y: 100 },
                  show: {
                    opacity: 1,
                    x: 0,
                    y: 0,
                  },
                }}
                initial="hidden"
                whileInView="show"
                transition={{ duration: 0.3, ease: "easeOut" }}
                viewport={{ once: true }}
                className="bg-cyprus text-cloud-white sm:w-1/2 w-2/5 rounded-full text-center sm:text-sm text-xs py-2 font-[600]"
              >
                Leading Healthcare Specialist
              </motion.p>

              <motion.h1
                variants={{
                  hidden: { opacity: 0, x: -100, y: 100 },
                  show: {
                    opacity: 1,
                    x: 0,
                    y: 0,
                  },
                }}
                initial="hidden"
                whileInView="show"
                transition={{ duration: 0.4, ease: "easeOut" }}
                viewport={{ once: true }}
                className="text-cloud-white text-[min(7vw,55px)] text-balance font-bold my-8 leading-[min(8vw,55px)]"
              >
                Basic Medical care for Your Family's Health
              </motion.h1>

              <motion.p
                variants={{
                  hidden: { opacity: 0, x: -100, y: 100 },
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
                className="text-cloud-white text-[clamp(14px, 2vw, 18px)] text-balance leading-[min(5vw,30px)]"
              >
                We provide adequate care for your basic healthcare needs,
                ensuring your family's well-being with our comprehensive medical
                services.
              </motion.p>

              <motion.div
                variants={{
                  hidden: { opacity: 0, x: -100, y: 100 },
                  show: {
                    opacity: 1,
                    x: 0,
                    y: 0,
                  },
                }}
                initial="hidden"
                whileInView="show"
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true }}
                className="my-9 flex gap-5 justify-end sm:justify-normal"
              >
                <Button
                  text="Book Appointment"
                  to="/login"
                  className="py-4 px-7 inline-block"
                />

                <ButtonB text="Explore Services" to="/services" />
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
                className="flex flex-col sm:flex-row gap-6"
              >
                <div className="flex items-center">
                  <i class="fa-solid fa-clock text-teal-800 text-3xl p-1"></i>
                  <div className="mx-2">
                    <p className="text-violet-200 text-sm">Working Hours:</p>
                    <p className="text-lg text-cloud-white font-bold">
                      Mon-Sun: 8AM-5PM
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <i class="fa-solid fa-phone text-teal-800 text-3xl p-1"></i>
                  <div className="mx-2">
                    <p className="text-violet-200 text-sm">Emergency Line:</p>
                    <p className="text-lg text-cloud-white font-bold">
                      0906 476 9973
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Spacer preserving the original layout width — the
                "Healthcare financing" card that used to sit here was
                removed, but the left column's size/position stays as it was. */}
            <div
              className="lg:w-120 w-full flex-shrink-0 hidden lg:block"
              aria-hidden="true"
            />
          </div>
        </section>

        <motion.section
          variants={parentVariant}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto w-9/10 sm:w-5/6 bg-black/75 p-10 flex gap-5 sm:gap-16 rounded-3xl m-10 mb-30 flex-col sm:flex-row"
        >
          {services.map((item, index) => (
            <motion.div key={index} variants={childVariant} className="flex">
              <div className="mt-3">
                <i
                  className={`${item.icon} bg-cyprus text-3xl p-3 text-teal-600 rounded-xl`}
                ></i>
              </div>

              <div className="mx-2">
                <p className="text-lg text-white my-1">{item.title}</p>
                <p className="text-violet-200 text-sm text-wrap">{item.text}</p>
              </div>
            </motion.div>
          ))}
        </motion.section>

        <section className="bg-white py-20 overflow-hidden dark:bg-gray-950 dark:text-cloud-white">
          <div className="mx-auto w-9/10 sm:w-5/6">
            <div className="flex items-center gap-10 flex-col-reverse sm:flex-row">
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
                className="relative w-full"
              >
                <img
                  loading="lazy"
                  src={Hospital}
                  alt="A4 Medical Consortium hospital building"
                  className="aspect-[4/3] w-full object-cover rounded-2xl shadow-md shadow-gray-400"
                />
                <div className="text-cloud-white bg-cyprus absolute right-10 -bottom-15 p-5 rounded-xl flex-col justify-center shadow-md shadow-gray-400">
                  <p className="font-bold text-4xl">11+</p>
                  <p>Years of excellence</p>
                </div>
              </motion.div>
              <motion.div
                variants={{
                  hidden: { opacity: 0, x: 150, y: 50 },
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
                className="w-full"
              >
                <h3 className="text-cyprus text-3xl text-wrap font-bold dark:text-teal-700">
                  Committed to Exceptional Patient <br />
                  Care
                </h3>

                <p className="text-cyprus opacity-70 text-wrap font-bold my-5 dark:text-teal-700">
                  Welcome to A4 Medical Consortium, where quality healthcare
                  meets true professionalism. Whether you need a routine
                  check-up, urgent care, or specialized testing, our doors are
                  open to help you get well now.
                </p>

                <p className="opacity-90 text-wrap">
                  We are deeply committed to providing affordable, reliable, and
                  accessible medical care to individuals and families in our
                  community.
                </p>

                <div className="my-15 flex gap-6 flex-col sm:flex-row">
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 150 },
                      show: { opacity: 1, y: 0 },
                    }}
                    initial="hidden"
                    whileInView="show"
                    transition={{ duration: 0.1, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="p-4 inset-shadow-2xs shadow-sm rounded-xl dark:shadow-gray-900 dark:inset-shadow-gray-900 hover:-translate-y-2 transition-all ease-out duration-300 hover:shadow-md"
                  >
                    <i className="fa-solid fa-heart-pulse text-3xl text-cyprus dark:text-teal-700"></i>

                    <p className="text-cyprus leading-12 font-semibold dark:text-teal-700">
                      Compassionate Care
                    </p>

                    <small className="text-sm text-justify text-gray-600 dark:text-gray-300">
                      We understand that when it comes to your health, time is
                      of the essence.
                    </small>
                  </motion.div>

                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 150 },
                      show: { opacity: 1, y: 0 },
                    }}
                    initial="hidden"
                    whileInView="show"
                    transition={{ duration: 0.1, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="p-4 inset-shadow-2xs shadow-sm rounded-xl dark:shadow-gray-900 dark:inset-shadow-gray-900 hover:-translate-y-2 transition-all ease-out duration-300 hover:shadow-md"
                  >
                    <i className="fa-regular fa-star text-3xl text-cyprus dark:text-teal-700"></i>

                    <p className="text-cyprus leading-12 font-semibold dark:text-teal-700">
                      Medical Excellence
                    </p>

                    <small className="text-sm text-justify text-gray-600 dark:text-gray-300">
                      We recognize the importance of accurate diagnoses and
                      proper treatment.
                    </small>
                  </motion.div>
                </div>

                <div className="mt-15 hidden sm:flex gap-5">
                  <Button
                    text="Learn More About Us"
                    to="/about"
                    className="inline-block rounded-xl py-4 px-7"
                  />

                  <ButtonB
                    text="Our Services"
                    to="/services"
                    className="inline-block rounded-xl text-cyprus hover:text-cloud-white hover:border-teal-800 dark:text-teal-700 dark:border-teal-700"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="bg-teal-50 py-15 px-2 sm:px-30 flex flex-col">
          <motion.h1
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
            className="text-cyprus text-center text-3xl font-bold headings relative"
          >
            Featured Services
          </motion.h1>

          <motion.small
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
            className="text-sm text-black opacity-75 text-center mt-12"
          >
            We specialize in a wide variety of medical services designed to meet
            your needs
          </motion.small>

          <motion.div
            variants={parentVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-7 mt-20 mb-7"
          >
            <FeaturedCards
              iconClass="fa-solid fa-vial"
              features="Laboratory & Diagnostics"
              description="Our clinic handles a wide range of diagnostic 
              and essential medical screenings. Rapid testing for Malaria,
               bacterial infections, and other common ailments."
              items={[
                "Malaria and Bacterial testing",
                "Urine and Pregnancy tests",
                "Preventive Screenings",
              ]}
            />

            <FeaturedCards
              iconClass="fa-solid fa-user-doctor"
              features="Medical Consultations"
              description="We provide prompt, professional medical attention
               tailored to your specific health needs."
              items={[
                "Basic Medical Treatment",
                "Expert Specialist Consultations",
              ]}
            />
          </motion.div>
          <motion.div
            variants={parentVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-7 mb-20"
          >
            <FeaturedCards
              iconClass="fa-solid fa-hospital-user"
              features="Patient Support Services"
              description="We are dedicated to ensuring that critical care
               and health management are always within your reach, so you
                can focus on getting well."
              items={["Payment Plans", "Critical Care Units"]}
            />
          </motion.div>
        </section>

        <section className="bg-white py-15 px-2 sm:px-30 overflow-hidden dark:bg-gray-950 dark:text-cloud-white flex flex-col">
          <div className="flex flex-col py-25">
            <motion.p
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
              className="text-3xl text-cyprus text-center dark:text-teal-700"
            >
              Your Health is Our Priority
            </motion.p>

            <motion.small
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
              className="text-[16px] text-center text-black opacity-75 py-2 dark:text-cloud-white"
            >
              We are committed to providing affordable, reliable, and accessible
              medical care to individuals and families.
              <br /> Whether you need a routine check-up, urgent care, or
              specialized testing, our doors are open.
            </motion.small>

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
              className="flex justify-center mt-5 gap-5"
            >
              <ButtonC text="Book Appointment" to="/login" />

              <ButtonB
                text="Contact Us"
                to="/contact"
                className="text-cyprus hover:text-cloud-white hover:border-teal-800 dark:text-cloud-white dark:border-teal-700"
              />
            </motion.div>
          </div>

          <motion.div
            variants={parentVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-7"
          >
            <ServicesCards
              iconClass="fa-solid fa-heart-pulse"
              title="24/7 Emergency Care"
              description="24/7 medical care, offering round-the-clock access to doctors and home health services."
              to="/services"
              link="Learn More"
            />

            <ServicesCards
              iconClass="fa-regular fa-calendar-check"
              title="Easy Online Booking"
              description="The system allows for 24/7 scheduling, reminders to reduce no-shows, and secure online payments."
              to="/login"
              link="Book Now"
            />

            <ServicesCards
              iconClass="fa-solid fa-user-doctor"
              title="Expert Medical Team"
              description="Consult with experienced medical specialists for comprehensive health evaluations and express medical care."
              to="/about"
              link="Meet Our Doctors"
            />
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
            className="bg-linear-to-r from-teal-800 to-cyprus rounded-xl p-4 sm:p-8 flex flex-col sm:flex-row gap-5 justify-between my-20"
          >
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
              transition={{ duration: 0.9, ease: "easeOut" }}
              viewport={{ once: true }}
              className="flex items-center"
            >
              <i class="fa-solid fa-phone text-cloud-white bg-teal-700/75 text-3xl p-4 mx-3 rounded-full"></i>
              <div className="mx-2">
                <p className="text-2xl text-cloud-white font-medium">
                  Medical Emergency?
                </p>
                <p className="text-gray-200 text-base leading-8">
                  Call our 24/7 emergency hotline for immediate assistance
                </p>
              </div>
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
              transition={{ duration: 1.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <a
                href="tel:+2349064769973"
                className="inline-block bg-cloud-white text-lg font-bold rounded-full py-4 px-3 shadow-teal-800 text-cyprus hover:-translate-y-1 hover:bg-teal-100 hover:shadow-lg transition-all ease-in-out duration-300"
              >
                <i class="fa-solid fa-phone px-3"></i>
                Call 0906 476 9973
              </a>
            </motion.div>
          </motion.div>
        </section>

        <section className="flex flex-col bg-white px-2 sm:px-80 py-10">
          <motion.h1
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
            className="text-cyprus text-center text-3xl font-bold headings relative"
          >
            Emergency Info
          </motion.h1>

          <motion.small
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
            className="text-[16px] text-center text-black opacity-75 mt-12"
          >
            We are dedicated to ensuring that health management is always within
            your reach.
          </motion.small>

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
            className="bg-linear-to-r from-red-500 to-red-700 rounded-xl gap-5 p-5 flex flex-col sm:flex-row justify-between mt-20 mb-10 shadow-red-500 shadow-lg"
          >
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
              transition={{ duration: 0.9, ease: "easeOut" }}
              viewport={{ once: true }}
              className="flex items-center"
            >
              <i class="fa-solid fa-triangle-exclamation text-cloud-white text-5xl mx-3"></i>
              <div className="mx-2">
                <p className="text-3xl text-cloud-white py-2 font-bold">
                  Medical Emergency?
                </p>
                <p className="text-cloud-white text-lg">
                  If you are experiencing a life-threatening emergency, call 112
                  immediately or go to your nearest emergency room.
                </p>
              </div>
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
              transition={{ duration: 1.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="flex items-center"
            >
              <a
                href="tel:112"
                className="flex items-center gap-3 bg-cloud-white text-red-700 text-lg font-bold rounded-full py-3 px-6 shadow-red-800 shadow-md hover:-translate-y-1 hover:shadow-xl transition-all ease-in-out duration-300"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                  <i className="fa-solid fa-phone text-red-700 text-xl"></i>
                </div>

                <div className="text-left leading-tight">
                  Call <br /> 112
                </div>
              </a>
            </motion.div>
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
            className="bg-white inset-shadow-2xs shadow-xl rounded-xl p-5 my-10"
          >
            <p className="text-cyprus text-2xl text-center mt-6">
              When to Seek Emergency Care
            </p>
            <div className="flex justify-around flex-col sm:flex-row">
              <ul>
                <li className="text-black/80 leading-15">
                  <i class="fa-regular fa-circle-check text-green-600 pr-2"></i>{" "}
                  Chest pain or difficulty breathing
                </li>
                <li className="text-black/80 leading-15">
                  <i class="fa-regular fa-circle-check text-green-600 pr-2"></i>{" "}
                  Severe allergic reactions
                </li>
                <li className="text-black/80 leading-15">
                  <i class="fa-regular fa-circle-check text-green-600 pr-2"></i>{" "}
                  Major trauma or injuries
                </li>
                <li className="text-black/80 leading-15">
                  <i class="fa-regular fa-circle-check text-green-600 pr-2"></i>{" "}
                  Signs of stroke or heart attack
                </li>
              </ul>

              <ul>
                <li className="text-black/80 leading-15">
                  <i class="fa-regular fa-circle-check text-green-600 pr-2"></i>{" "}
                  Severe burns or bleeding
                </li>
                <li className="text-black/80 leading-15">
                  <i class="fa-regular fa-circle-check text-green-600 pr-2"></i>{" "}
                  Loss of consciousness
                </li>
                <li className="text-black/80 leading-15">
                  <i class="fa-regular fa-circle-check text-green-600 pr-2"></i>{" "}
                  Severe abdominal pain
                </li>
                <li className="text-black/80 leading-15">
                  <i class="fa-regular fa-circle-check text-green-600 pr-2"></i>{" "}
                  High fever with concoction
                </li>
              </ul>
            </div>
          </motion.div>
        </section>
      </div>
    </>
  );
}

export default Home;

import { useState } from "react";
import { ButtonD } from "../components/Button.jsx";
import { motion } from "framer-motion";
import {
  ServiceCards,
  EmergencyCards,
  ScheduleCards,
} from "../components/Cards.jsx";

function Services() {
  const [activeTab, setActiveTab] = useState("Primary Care");

  const tabs = ["Primary Care", "Speciality Care", "Diagnostics", "Emergency"];

  const cards = [
    {
      category: "Primary Care",
      iconClass: "fa-solid fa-stethoscope",
      features: "General Consultation",
      description:
        "Our general consultation services serve as your primary contact for all health-related concerns.",
      items: [
        "Comprehensive Health Assessment",
        "Preventive Care Planning",
        "Health Monitoring",
      ],
    },
    {
      category: "Primary Care",
      iconClass: "fa-solid fa-syringe",
      features: "Vaccination Services",
      description:
        "We provide vaccination services to protect you and your family from preventable diseases.",
      items: ["Adult Immunizations", "Travel Vaccines", "Flu Shots"],
    },
    {
      category: "Primary Care",
      iconClass: "fa-solid fa-baby",
      features: "Maternal Health",
      description:
        "We are dedicated to ensuring the health, safety, and comfort of mothers and their babies.",
      items: ["Prenatal Care", "Delivery Support", "Postnatal Care"],
    },
    {
      category: "Primary Care",
      iconClass: "fa-solid fa-user-doctor",
      features: "Family Medicine",
      description:
        "Our family medicine provides care to patients of all ages, genders, and health conditions.",
      items: [
        "All-Age Care",
        "Chronic Disease Management",
        "Wellness Programs",
      ],
    },
    {
      category: "Speciality Care",
      iconClass: "fa-solid fa-hand-dots",
      features: "Dermatology",
      description:
        "Evaluation and treatment for common conditions like acne, eczema, and dermatitis.",
      items: [
        "General Skin Consultations",
        "Skin Infection Treatment",
        "Mole and Lesion Evaluation",
      ],
    },
    {
      category: "Speciality Care",
      iconClass: "fa-solid fa-viruses",
      features: "Pathology",
      description:
        "Our pathology department ensures precise and rapid analysis of clinical specimens.",
      items: ["Clinical Pathology", "Microbiology & Cultures", "Genotype & Blood Grouping"],
    },
    {
      category: "Speciality Care",
      iconClass: "fa-solid fa-person-pregnant",
      features: "Gynaecology",
      description:
        "We provide compassionate, specialized care tailored to women at every stage of life.",
      items: ["Pregnancy & Prenatal Services", "Screening & Prevention", "Routine Well-Woman Exams"],
    },
    {
      category: "Diagnostics",
      iconClass: "fa-solid fa-vial",
      features: "Laboratory Testing",
      description:
        "Fast, on-site laboratory testing paired with immediate treatment plans.",
      items: ["Blood Analysis", "Pathology Services", "Quick Results"],
    },
  ];

  const emergencyCards = [
    {
      iconClass: "fa-solid fa-truck-medical",
      features: "24/7 Emergency Care",
      description:
        "24/7 medical care, offering round-the-clock access to doctors and home health services. We are dedicated to ensuring that health management is always within your reach.",
      items: [
        "Round-the-Clock Availability",
        "Call our emergency hotline for immediate assistance",
        "The system allows for 24/7 scheduling",
        "Secure online payments",
      ],
      className: "items-center text-center",
    },
  ];

  const filteredCards = cards.filter((card) => card.category === activeTab);

  return (
    <div className="m-2">
      <div className="absolute left-0 top-0 w-full h-full bg-white pt-50 dark:bg-gray-900 -z-10"></div>

      <h2 className="text-center text-cyprus text-5xl font-bold dark:text-cloud-white">
        Services
      </h2>

      <p className="text-black opacity-65 dark:text-white text-lg text-center my-5">
        We specialize in basic medical treatments, expert health consultations, 
        and a wide variety of medical <br className="hidden sm:inline-block" />{" "}
        services designed to meet your needs.
      </p>

      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex mx-auto my-15 gap-4 justify-center w-max">
          {tabs.map((tab) => (
            <ButtonD
              key={tab}
              text={tab}
              onClick={() => setActiveTab(tab)}
              active={activeTab === tab}
            />
          ))}
        </div>
      </div>

      <div>
        {activeTab === "Emergency" ? (
          <div className="w-full sm:w-5/6 mx-auto">
            {emergencyCards.map((item, index) => (
              <EmergencyCards
                key={index}
                features={item.features}
                description={item.description}
                iconClass={item.iconClass}
                items={item.items}
              />
            ))}
          </div>
        ) : (
          <div className="w-full sm:w-5/6 mx-auto my-15 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredCards.map((card, index) => (
              <ServiceCards
                key={index}
                features={card.features}
                description={card.description}
                items={card.items}
                iconClass={card.iconClass}
              />
            ))}
          </div>
        )}
      </div>

      <ScheduleCards />
    </div>
  );
}

export default Services;

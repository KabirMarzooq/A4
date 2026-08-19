function TermsOfService() {
  return (
    <div className="m-2">
      <div className="absolute left-0 top-0 w-full h-full bg-white pt-50 dark:bg-gray-900 -z-10"></div>

      <h2 className="text-center text-cyprus text-5xl font-bold dark:text-cloud-white">
        Terms of Service
      </h2>

      <p className="text-black opacity-65 dark:text-white text-lg text-center my-5">
        The terms that apply when you use the A4 Medical Consortium system.
      </p>

      <div className="max-w-3xl mx-auto px-4 sm:px-0 my-10 text-black dark:text-cloud-white space-y-8">
        <p className="text-sm opacity-60">Last updated: August 2026</p>

        <section>
          <h3 className="text-cyprus dark:text-teal-400 text-xl font-bold mb-2">
            1. Acceptance of Terms
          </h3>
          <p className="opacity-80 leading-7">
            By creating an account or using this system, you agree to these
            terms. If you do not agree, please do not use the platform —
            contact the hospital directly instead.
          </p>
        </section>

        <section>
          <h3 className="text-cyprus dark:text-teal-400 text-xl font-bold mb-2">
            2. What This System Is For
          </h3>
          <p className="opacity-80 leading-7">
            This platform lets patients book appointments, view prescriptions
            and bills, and request medical reports, and lets hospital staff
            manage appointments, records, billing, and pharmacy inventory. It
            is a tool for administering your care, not a substitute for a
            doctor's professional judgment.
          </p>
        </section>

        <section>
          <h3 className="text-cyprus dark:text-teal-400 text-xl font-bold mb-2">
            3. Not for Emergencies
          </h3>
          <p className="opacity-80 leading-7">
            This platform is not monitored in real time and must never be
            used to report a medical emergency. If you are experiencing a
            life-threatening emergency, call the hospital's emergency line or
            112 immediately, or go to the nearest emergency room.
          </p>
        </section>

        <section>
          <h3 className="text-cyprus dark:text-teal-400 text-xl font-bold mb-2">
            4. Your Account
          </h3>
          <ul className="list-disc pl-6 opacity-80 leading-7 space-y-1">
            <li>You're responsible for keeping your login credentials confidential and for all activity under your account</li>
            <li>Information you provide (contact details, personal and family information) must be accurate — inaccurate information can affect the safety of your care</li>
            <li>Doctor, receptionist, pharmacy, and lab accounts are subject to admin approval before use, to confirm the applicant is genuinely hospital staff</li>
            <li>Tell us immediately if you believe your account has been accessed without your permission</li>
          </ul>
        </section>

        <section>
          <h3 className="text-cyprus dark:text-teal-400 text-xl font-bold mb-2">
            5. Appropriate Use
          </h3>
          <p className="opacity-80 leading-7">
            You agree not to misuse the platform — this includes attempting
            to access another patient's or staff member's account or records,
            submitting false information, or using the system for any purpose
            other than your own care or, for staff, your assigned duties.
          </p>
        </section>

        <section>
          <h3 className="text-cyprus dark:text-teal-400 text-xl font-bold mb-2">
            6. Fees and Payment
          </h3>
          <p className="opacity-80 leading-7">
            Charges for consultations, medication, and other services are as
            communicated to you at the point of care and reflected on your
            invoice. Payment is collected by hospital staff through the
            methods offered at the time (cash, POS, or bank transfer).
          </p>
        </section>

        <section>
          <h3 className="text-cyprus dark:text-teal-400 text-xl font-bold mb-2">
            7. Availability
          </h3>
          <p className="opacity-80 leading-7">
            We aim to keep the platform available and reliable, but it may
            occasionally be unavailable for maintenance or due to factors
            outside our control (such as an internet outage). Availability of
            the online system does not affect your ability to receive
            in-person care at the hospital.
          </p>
        </section>

        <section>
          <h3 className="text-cyprus dark:text-teal-400 text-xl font-bold mb-2">
            8. Changes to These Terms
          </h3>
          <p className="opacity-80 leading-7">
            We may update these terms from time to time. Continuing to use
            the platform after an update means you accept the revised terms.
          </p>
        </section>

        <section>
          <h3 className="text-cyprus dark:text-teal-400 text-xl font-bold mb-2">
            9. Governing Law
          </h3>
          <p className="opacity-80 leading-7">
            These terms are governed by the laws of the Federal Republic of
            Nigeria.
          </p>
        </section>

        <section>
          <h3 className="text-cyprus dark:text-teal-400 text-xl font-bold mb-2">
            10. Contact Us
          </h3>
          <p className="opacity-80 leading-7">
            Questions about these terms can be sent to{" "}
            <a
              href="mailto:a4consortium@gmail.com"
              className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
            >
              a4consortium@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}

export default TermsOfService;

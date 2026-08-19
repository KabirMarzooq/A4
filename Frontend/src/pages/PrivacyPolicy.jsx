function PrivacyPolicy() {
  return (
    <div className="m-2">
      <div className="absolute left-0 top-0 w-full h-full bg-white pt-50 dark:bg-gray-900 -z-10"></div>

      <h2 className="text-center text-cyprus text-5xl font-bold dark:text-cloud-white">
        Privacy Policy
      </h2>

      <p className="text-black opacity-65 dark:text-white text-lg text-center my-5">
        How A4 Medical Consortium collects, uses, and protects your
        information.
      </p>

      <div className="max-w-3xl mx-auto px-4 sm:px-0 my-10 text-black dark:text-cloud-white space-y-8">
        <p className="text-sm opacity-60">Last updated: August 2026</p>

        <section>
          <h3 className="text-cyprus dark:text-teal-400 text-xl font-bold mb-2">
            1. Information We Collect
          </h3>
          <p className="opacity-80 leading-7">
            When you register, book an appointment, or receive care through
            this system, we collect information such as your name, date of
            birth, sex, phone number, email address, home address, and, where
            relevant to your care, medical and health information (visit
            history, diagnoses, prescriptions, lab results, blood type and
            genotype, and next-of-kin details). Billing information is
            collected when an invoice is raised for services rendered.
          </p>
        </section>

        <section>
          <h3 className="text-cyprus dark:text-teal-400 text-xl font-bold mb-2">
            2. Why We Collect It
          </h3>
          <ul className="list-disc pl-6 opacity-80 leading-7 space-y-1">
            <li>To register you as a patient and maintain your medical record</li>
            <li>To schedule, confirm, and remind you of appointments</li>
            <li>To enable doctors to diagnose, treat, and prescribe medication safely</li>
            <li>To generate invoices and receipts for services provided</li>
            <li>To respond to support requests and medical report requests</li>
            <li>To meet legal and regulatory record-keeping obligations that apply to healthcare providers in Nigeria</li>
          </ul>
        </section>

        <section>
          <h3 className="text-cyprus dark:text-teal-400 text-xl font-bold mb-2">
            3. Who Can See Your Information
          </h3>
          <p className="opacity-80 leading-7">
            Access is restricted by role. Doctors and receptionists can see
            the clinical and contact details needed to provide your care;
            pharmacy staff can see prescriptions relevant to dispensing
            medication; administrators can see account and billing
            information needed to run the hospital. We do not sell your
            information, and we do not share it with third parties for
            marketing purposes. Information is only disclosed outside the
            hospital where required by law, or with your explicit consent
            (for example, when you request a copy of your medical report to
            share with another provider).
          </p>
        </section>

        <section>
          <h3 className="text-cyprus dark:text-teal-400 text-xl font-bold mb-2">
            4. How We Protect Your Information
          </h3>
          <p className="opacity-80 leading-7">
            Every account is protected by a password we never store in plain
            text. Access to patient records is limited to staff accounts
            approved by a hospital administrator, and each role only sees the
            information it needs to do its job. All actions taken on patient
            records are logged.
          </p>
        </section>

        <section>
          <h3 className="text-cyprus dark:text-teal-400 text-xl font-bold mb-2">
            5. How Long We Keep It
          </h3>
          <p className="opacity-80 leading-7">
            We retain your medical records for as long as you remain a
            patient of the hospital, and afterward for as long as applicable
            healthcare recordkeeping regulations in Nigeria require. Account
            and billing information is retained for as long as necessary for
            the purposes above or as required by law.
          </p>
        </section>

        <section>
          <h3 className="text-cyprus dark:text-teal-400 text-xl font-bold mb-2">
            6. Your Rights
          </h3>
          <p className="opacity-80 leading-7 mb-2">
            Under the Nigeria Data Protection Act (NDPA) 2023, you have the
            right to:
          </p>
          <ul className="list-disc pl-6 opacity-80 leading-7 space-y-1">
            <li>Know what personal data we hold about you and why</li>
            <li>Request a copy of your medical records (see the Medical Reports section of your dashboard)</li>
            <li>Ask us to correct inaccurate information</li>
            <li>Ask us to delete your information, where retaining it is not required by law</li>
            <li>Withdraw consent for non-essential communication at any time</li>
            <li>Lodge a complaint with the Nigeria Data Protection Commission (NDPC) if you believe your data has been mishandled</li>
          </ul>
          <p className="opacity-80 leading-7 mt-2">
            To exercise any of these rights, contact us using the details
            below or speak to a hospital administrator directly.
          </p>
        </section>

        <section>
          <h3 className="text-cyprus dark:text-teal-400 text-xl font-bold mb-2">
            7. Children's Information
          </h3>
          <p className="opacity-80 leading-7">
            Where a patient is a minor, their record is registered and
            managed by a parent or guardian, who provides consent on the
            minor's behalf.
          </p>
        </section>

        <section>
          <h3 className="text-cyprus dark:text-teal-400 text-xl font-bold mb-2">
            8. Changes to This Policy
          </h3>
          <p className="opacity-80 leading-7">
            If this policy changes in a way that affects how your information
            is used, we will update the date at the top of this page and, for
            significant changes, notify registered users.
          </p>
        </section>

        <section>
          <h3 className="text-cyprus dark:text-teal-400 text-xl font-bold mb-2">
            9. Contact Us
          </h3>
          <p className="opacity-80 leading-7">
            Questions about this policy or your data can be sent to{" "}
            <a
              href="mailto:a4consortium@gmail.com"
              className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
            >
              a4consortium@gmail.com
            </a>{" "}
            or raised through the Support page once logged in.
          </p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy;

export default function LawyerTOSPage() {
  return (
    <main className="min-h-screen bg-sindicato-charcoal text-sindicato-warm-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-3xl font-bold mb-8 font-[family-name:var(--font-barlow)] uppercase tracking-wider">
          Terms of Service — Legal Professionals
        </h1>

        <div className="space-y-6 text-sindicato-warm-white/80 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-sindicato-warm-white mb-3 font-[family-name:var(--font-barlow)]">1. Purpose of Access</h2>
            <p>
              By accessing the Sindicato platform as a legal professional, you agree to use case data solely for the purpose of identifying and engaging with workers who have opted into legal representation. You may filter cases individually or collectively to find those that match your practice areas and offer your services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sindicato-warm-white mb-3 font-[family-name:var(--font-barlow)]">2. Data You Can Access</h2>
            <p>
              You will have access to: case numbers, case contents (including worker stories and timelines), and aliased contact emails. You may use the Clerk AI system to query, filter, and export this data within the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sindicato-warm-white mb-3 font-[family-name:var(--font-barlow)]">3. Anonymized Emails</h2>
            <p>
              All worker emails are anonymized through Sindicato&apos;s alias system. You will only ever receive aliased contact addresses (<code>case-xxxx@domain</code>) that forward to the worker&apos;s real email. You must not attempt to de-anonymize, trace, or expose a worker&apos;s real identity outside of their explicit, voluntary disclosure to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sindicato-warm-white mb-3 font-[family-name:var(--font-barlow)]">4. Worker Consent</h2>
            <p>
              Workers only share their contact information if they explicitly opt in during the case filing process. You will only be able to contact workers who have opted in. You must respect each worker&apos;s choice and not attempt to contact workers who have not opted in.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sindicato-warm-white mb-3 font-[family-name:var(--font-barlow)]">5. Data Confidentiality</h2>
            <p>
              Case data accessed through this platform is confidential. You must not redistribute, publish, or share case details or contact information outside of your firm without explicit worker consent. All access is logged and auditable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sindicato-warm-white mb-3 font-[family-name:var(--font-barlow)]">6. Compliance & Accountability</h2>
            <p>
              Your access is conditional on compliance with these terms. Violations may result in immediate revocation of access, reporting to relevant bar associations or legal authorities, and legal action by affected workers.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

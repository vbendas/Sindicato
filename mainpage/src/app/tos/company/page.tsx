export default function CompanyTOSPage() {
  return (
    <main className="min-h-screen bg-sindicato-charcoal text-sindicato-warm-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-3xl font-bold mb-8 font-[family-name:var(--font-barlow)] uppercase tracking-wider">
          Terms of Service — Companies
        </h1>

        <div className="space-y-6 text-sindicato-warm-white/80 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-sindicato-warm-white mb-3 font-[family-name:var(--font-barlow)]">1. Purpose of Access</h2>
            <p>
              By accessing the Sindicato platform as a company representative, you agree to use case data solely for the purpose of understanding and addressing worker complaints filed against your company. The goal is to resolve issues, not to identify or retaliate against workers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sindicato-warm-white mb-3 font-[family-name:var(--font-barlow)]">2. Data You Can Access</h2>
            <p>
              You will have access to: case numbers, case contents (including worker stories and timelines), and aliased contact emails specifically for cases filed against your company. You may use the Clerk AI system to query and filter cases filed against your company.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sindicato-warm-white mb-3 font-[family-name:var(--font-barlow)]">3. Anonymized Emails</h2>
            <p>
              All worker emails are anonymized through Sindicato&apos;s alias system. You will only ever receive aliased contact addresses that forward to the worker&apos;s real email. You must not attempt to de-anonymize, trace, or expose a worker&apos;s real identity. Workers only share their data if they explicitly opt in.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sindicato-warm-white mb-3 font-[family-name:var(--font-barlow)]">4. No Retaliation</h2>
            <p className="font-bold text-sindicato-warm-white">
              Any form of retaliation against workers who filed reports is strictly prohibited.
            </p>
            <p className="mt-2">
              Sindicato is a public platform. All case data — including filings, timelines, amounts claimed, and correspondence — is part of the public record. This data can and will be used as evidence of retaliation in legal proceedings, regulatory complaints, and public reporting.
            </p>
            <p className="mt-2">
              Retaliation includes but is not limited to: termination, demotion, harassment, threats, pay reduction, deactivation, blacklisting, or any adverse action taken because a worker filed a report.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sindicato-warm-white mb-3 font-[family-name:var(--font-barlow)]">5. Worker Consent</h2>
            <p>
              Workers only share their contact information if they explicitly opt in during the case filing process. You will only be able to contact workers who have opted in to be contacted by their company.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sindicato-warm-white mb-3 font-[family-name:var(--font-barlow)]">6. Audit & Compliance</h2>
            <p>
              All access to case data is logged, timestamped, and auditable. Your company name, representative information, and access history may be disclosed in legal proceedings. By accepting these terms, you consent to this transparency.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

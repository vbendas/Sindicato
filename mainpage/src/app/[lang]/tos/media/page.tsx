export default function MediaTOSPage() {
  return (
    <main className="min-h-screen bg-sindicato-charcoal text-sindicato-warm-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-3xl font-bold mb-8 font-[family-name:var(--font-barlow)] uppercase tracking-wider">
          Terms of Service — Media & Research
        </h1>

        <div className="space-y-6 text-sindicato-warm-white/80 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-sindicato-warm-white mb-3 font-[family-name:var(--font-barlow)]">1. Purpose of Access</h2>
            <p>
              By accessing the Sindicato platform as a media or research professional, you agree to use case data for public interest purposes: journalism, content creation, academic research, policy analysis, and studies on worker exploitation. You may verify individual cases and contact workers who have consented to be contacted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sindicato-warm-white mb-3 font-[family-name:var(--font-barlow)]">2. Data You Can Access</h2>
            <p>
              You will have access to: case numbers, case contents (including worker stories and timelines), and aliased contact emails. You may use the Clerk AI system to query, filter, and analyze case data within the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sindicato-warm-white mb-3 font-[family-name:var(--font-barlow)]">3. Anonymized Emails & Privacy</h2>
            <p>
              All worker emails are anonymized through Sindicato&apos;s alias system. You will only ever receive aliased contact addresses that forward to the worker&apos;s real email. You must not attempt to de-anonymize, trace, or expose a worker&apos;s real identity. Workers only share their data if they explicitly opt in. You must respect each worker&apos;s privacy choices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sindicato-warm-white mb-3 font-[family-name:var(--font-barlow)]">4. Responsible Use</h2>
            <p>
              You must not use accessed data for: doxxing, harassment, public shaming of individual workers, or any purpose that could cause harm to the workers who filed reports. All published content derived from this data should fairly represent the cases and not mislead the public.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sindicato-warm-white mb-3 font-[family-name:var(--font-barlow)]">5. Attribution</h2>
            <p>
              When publishing stories or research based on Sindicato data, we request attribution to Sindicato as the source. This helps maintain transparency and allows readers to verify claims.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-sindicato-warm-white mb-3 font-[family-name:var(--font-barlow)]">6. Audit & Compliance</h2>
            <p>
              All access to case data is logged, timestamped, and auditable. Violations of these terms may result in immediate revocation of access and, in serious cases, legal action by affected workers or Sindicato.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

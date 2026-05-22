import Header from "@/app/components/Header";

export default function TransparencyPage() {
  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[60] grain-overlay" style={{ opacity: 0.45 }} />
      <Header />
      <div className="relative pt-24 pb-16 bg-sindicato-charcoal">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sindicato-cream mb-4">
              Financial Transparency
            </h1>
            <p className="text-sindicato-cream/60 text-lg">
              Every euro received. Every euro spent. Published publicly.
            </p>
          </div>

          <div className="bg-sindicato-cream/5 border border-sindicato-cream/10 p-8 text-center">
            <p className="text-sindicato-cream/40 text-lg">
              Financial data will be published here once the platform is operational.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

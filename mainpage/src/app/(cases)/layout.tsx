export default function CasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sindicato-charcoal">
      {children}
    </div>
  );
}

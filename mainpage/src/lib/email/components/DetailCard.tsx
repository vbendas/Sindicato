interface DetailCardProps {
  children: React.ReactNode;
}

export default function DetailCard({ children }: DetailCardProps) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: 8,
        padding: 20,
        marginBottom: 20,
      }}
    >
      {children}
    </div>
  );
}

export function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <p style={{ margin: "4px 0", fontSize: 14, color: "#555" }}>
      <strong>{label}:</strong> {children}
    </p>
  );
}

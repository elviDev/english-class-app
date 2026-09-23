export function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-sm font-semibold text-heading">{label}</label>
      {children}
    </div>
  );
}

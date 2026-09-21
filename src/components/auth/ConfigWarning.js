export function ConfigWarning() {
  return (
    <div className="rounded-lg bg-danger px-4 py-2.5 text-center text-sm text-white">
      Not connected yet, add your Supabase and Gemini keys to .env.local. See SETUP.md.
    </div>
  );
}

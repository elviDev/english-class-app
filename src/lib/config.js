const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseUrl = url;
export const supabaseAnonKey = anonKey;

export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes("YOUR_") && !anonKey.includes("YOUR_")
);

export const site = {
  name: "English Class",
  description: "Class chat, private messages, assignments, and an AI study buddy for a small English class.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
};

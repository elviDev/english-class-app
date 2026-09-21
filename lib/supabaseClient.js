"use client";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isConfigured = !!url && !!key && !url.includes("YOUR_") && !key.includes("YOUR_");

export const supabase = isConfigured ? createClient(url, key) : null;

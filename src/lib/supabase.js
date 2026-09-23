import { createClient } from "@supabase/supabase-js";

console.log("ENV:", import.meta.env);

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("URL:", url);
console.log("KEY:", anonKey ? "FOUND" : "MISSING");

export const supabaseConfigured = Boolean(url && anonKey);

export const supabase = supabaseConfigured
  ? createClient(url, anonKey)
  : null;
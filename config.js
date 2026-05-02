/* =========================================================
   RIBERMS — Supabase Config
   ---------------------------------------------------------
   EDIT THIS FILE with your own Supabase credentials.

   1. Open your Supabase project at https://supabase.com
   2. Go to Project Settings (gear icon, bottom-left)
   3. Click "Data API" in the sidebar
   4. Copy "Project URL" -> paste into `url` below
   5. Copy "anon public" key (NOT service_role) -> paste into `anonKey`
   6. Save this file.

   The anon key is safe to expose in the browser — it can only do
   what your Row Level Security policies allow.
   ========================================================= */

const SUPABASE_CONFIG = {
  url:     'YOUR_SUPABASE_URL_HERE',      // e.g. 'https://abcdef123456.supabase.co'
  anonKey: 'YOUR_SUPABASE_ANON_KEY_HERE', // long JWT-like string starting with "eyJ..."
};

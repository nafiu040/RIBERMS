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
  url:     'https://jcppvoxncwiywdpdmwnp.supabase.co',      // e.g. 'https://abcdef123456.supabase.co'
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjcHB2b3huY3dpeXdkcGRtd25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxOTcwMjAsImV4cCI6MjA5Mjc3MzAyMH0.VQEjDtSPLJAwQEzreaC_8GapMvvSXNppf6XihwNKAQ0', // long JWT-like string starting with "eyJ..."
};

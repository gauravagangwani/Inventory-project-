// Supabase Client Initialization
// ─────────────────────────────────────────────────────────────────────────────
// NOTE: Get your keys from Supabase Dashboard → Settings → API
//   • Project URL  → copy from "Project URL"
//   • Anon Key     → copy from "Project API keys → anon public"
//     (It should start with "eyJ..." — a long JWT string)
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://dobwvesvebhkbzlrczex.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_e3EBgI5hwrH15zHoh58Yrg_ujnuaBzj';

// Load Supabase from CDN (loaded before this script in index.html)
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabaseClient = _supabase;

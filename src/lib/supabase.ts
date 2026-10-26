import { createClient } from '@supabase/supabase-js';
const raw=import.meta.env.VITE_SUPABASE_URL?.replace(/[\[\]]/g,'').trim();
const url=raw?.startsWith('https://') ? raw : `https://${raw}.supabase.co`;
export const supabase = createClient(url, import.meta.env.VITE_SUPABASE_ANON_KEY, { auth:{ persistSession:false }, global: { fetch: (input, init) => fetch(input,{...init,signal:init?.signal || AbortSignal.timeout(10000)}) } });

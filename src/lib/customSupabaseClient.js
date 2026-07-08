import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wgmcctnihewszwyeqjjk.supabase.co';
// Public anon key for this Supabase project. Never use service_role or secret keys in frontend code.
const supabaseAnonKey = 'sb_publishable_2bSF6jHZuon6-XQaFCWd2w_1qmeWRLv';

if (import.meta.env.DEV) {
    console.info('[Supabase] URL:', supabaseUrl);
}

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};

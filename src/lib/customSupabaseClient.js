import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ublwagjjoaemjyftkzaj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibHdhZ2pqb2FlbWp5ZnRremFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NTIwODYsImV4cCI6MjA4NDUyODA4Nn0.jnOgpup9l2tG2XfBIFPAghpUxHANqBJiV81IoaOGPGk';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};

// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://yvydoqppqkmibeuioqgm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2eWRvcXBwcWttaWJldWlvcWdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NDAyMDYsImV4cCI6MjA1OTIxNjIwNn0._T2BnLU8OJmDLDAHb-eJfZJq9ZXr-TXDFqV5hjX9pEA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
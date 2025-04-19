
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zozwupfhtpwgizlwadfm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvend1cGZodHB3Z2l6bHdhZGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxMDM4MTgsImV4cCI6MjA2MDY3OTgxOH0.7_00c8AjzSJFHsFmzh69w4eRUW5G_Qj96Vj4PUgvwkE";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

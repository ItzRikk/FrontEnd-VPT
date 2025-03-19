//this is the connection to the database it lets us use it as an API
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ifkmefcurfniuefcolgr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlma21lZmN1cmZuaXVlZmNvbGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4NDQ0MzYsImV4cCI6MjA1NzQyMDQzNn0.mh4RFqPyp3elLmTqG1CPknKIxyqa44ddHhXcNM13Mx4'; // Replace with your anon key


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
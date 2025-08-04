// Configurações do Supabase
const SUPABASE_URL = 'https://jvecwvzvexbkoikrslsk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2ZWN3dnp2ZXhia29pa3JzbHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzY3NzUsImV4cCI6MjA2OTkxMjc3NX0.Q1NUJQnQ5PbIGUjDl8v9ta-kUuuoCB7MXjVvYTTvcu0';

// Inicialização do cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY); 
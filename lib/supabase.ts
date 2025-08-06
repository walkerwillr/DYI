import { createClient } from '@supabase/supabase-js'

// Verificar se as variáveis de ambiente estão definidas
// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = "https://jvecwvzvexbkoikrslsk.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2ZWN3dnp2ZXhia29pa3JzbHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMzY3NzUsImV4cCI6MjA2OTkxMjc3NX0.Q1NUJQnQ5PbIGUjDl8v9ta-kUuuoCB7MXjVvYTTvcu0"


if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing!')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file')
}

// Usar valores padrão temporários se as variáveis não estiverem definidas
const defaultUrl = supabaseUrl || 'https://demo.supabase.co'
const defaultKey = supabaseAnonKey || 'demo-key'

export const supabase = createClient(defaultUrl, defaultKey)

// Função para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'https://demo.supabase.co' && 
    supabaseAnonKey !== 'demo-key')
}

// Função para testar conectividade
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('nodes').select('count').limit(1)
    return { success: !error, error }
  } catch (error) {
    return { success: false, error }
  }
}

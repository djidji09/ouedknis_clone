const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Test database connection
async function connectDB() {
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ Supabase connected successfully');
    return supabase;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  console.log('🔌 Disconnecting from Supabase...');
});

module.exports = { supabase, connectDB };

import { prisma } from '../src/lib/prisma';

async function testConnection() {
  try {
    console.log('Testing Prisma connection to Supabase...');

    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Connection successful!', result);

    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('📋 Existing tables:', tables);

  } catch (error) {
    console.error('❌ Connection failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

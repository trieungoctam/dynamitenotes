#!/usr/bin/env node
/**
 * Create Admin User Script
 * Usage: node scripts/create-admin.js <username> <password>
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Supabase credentials from environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error('Usage: node scripts/create-admin.js <username> <password>');
  console.error('Example: node scripts/create-admin.js admin mypassword123');
  process.exit(1);
}

// Simple password hashing (for Node.js environment)
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('base64');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('base64');
  return `${salt}$${hash}`;
}

async function createAdmin() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`Creating admin user: ${username}`);

  // Check if username already exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (existingProfile) {
    console.error(`Error: Username "${username}" already exists`);
    process.exit(1);
  }

  // Hash password
  const passwordHash = hashPassword(password);

  // Create profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      username,
      password_hash: passwordHash,
    })
    .select()
    .single();

  if (profileError) {
    console.error('Error creating profile:', profileError);
    process.exit(1);
  }

  console.log(`✓ Created profile: ${profile.id}`);

  // Add to admins table
  const { error: adminError } = await supabase
    .from('admins')
    .insert({
      profile_id: profile.id,
    });

  if (adminError) {
    console.error('Error adding to admins:', adminError);
    process.exit(1);
  }

  console.log(`✓ Added to admins table`);
  console.log(`\nAdmin user created successfully!`);
  console.log(`Username: ${username}`);
  console.log(`You can now login at /login`);
}

createAdmin().catch(console.error);

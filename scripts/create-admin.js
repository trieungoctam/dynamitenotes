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

// Generate UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = crypto.randomBytes(1)[0] % 16;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
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

  // Generate UUID for the profile
  const profileId = generateUUID();

  // Create profile with plain text password
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: profileId,
      username,
      password_hash: password, // Store plain text
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
  console.log(`Password: ${password}`);
  console.log(`You can now login at /login`);
}

createAdmin().catch(console.error);

import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/.env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("🌱 Starting database seeding...");

  // 1. Create subscriptions
  const plans = [
    { plan_name: 'Basic', monthly_price: 29.99 },
    { plan_name: 'Pro', monthly_price: 99.99 },
    { plan_name: 'Enterprise', monthly_price: 499.99 },
  ];

  console.log("Inserting subscriptions...");
  const { data: subscriptions, error: subError } = await supabase
    .from('subscriptions')
    .insert(plans)
    .select();

  if (subError || !subscriptions) {
    console.error("Error inserting subscriptions:", subError);
    return;
  }

  // 2. Create users
  console.log("Inserting users...");
  const usersToInsert = Array.from({ length: 50 }).map(() => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    status: faker.helpers.arrayElement(['Active', 'Inactive']),
    created_at: faker.date.past({ years: 1 }).toISOString(),
  }));

  const { data: users, error: userError } = await supabase
    .from('users')
    .insert(usersToInsert)
    .select();

  if (userError || !users) {
    console.error("Error inserting users:", userError);
    return;
  }

  // 3. Create transactions
  console.log("Inserting transactions...");
  const transactionsToInsert = Array.from({ length: 200 }).map(() => {
    const user = faker.helpers.arrayElement(users);
    const subscription = faker.helpers.arrayElement(subscriptions);
    
    return {
      user_id: user.id,
      subscription_id: subscription.id,
      amount: subscription.monthly_price,
      status: faker.helpers.arrayElement(['Success', 'Success', 'Success', 'Pending', 'Failed']),
      created_at: faker.date.between({ from: user.created_at, to: new Date() }).toISOString(),
    };
  });

  // Insert in chunks if needed, but 200 is small enough
  const { error: txError } = await supabase
    .from('transactions')
    .insert(transactionsToInsert);

  if (txError) {
    console.error("Error inserting transactions:", txError);
    return;
  }

  console.log("✅ Database seeding completed successfully!");
}

seed();

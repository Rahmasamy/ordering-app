import { Knex } from 'knex';
import knexConfig from '../src/common/knex/knexConfig.js';
import knex from 'knex';

const db: Knex = knex(knexConfig);

async function runMigration() {
  const command = process.argv[2];
  const migrationName = process.argv[3];

  try {
    if (command === 'make' && migrationName) {
      console.log(`Creating migration: ${migrationName}`);
      const result = await db.migrate.make(migrationName);
      console.log(`Migration created: ${result}`);
    } else if (command === 'up') {
      console.log('Running pending migrations...');
      const result = await db.migrate.latest();
      console.log(`Migrations completed:`, result);
    } else if (command === 'down') {
      console.log('Rolling back last migration...');
      const result = await db.migrate.rollback();
      console.log(`Rollback completed:`, result);
    } else if (command === 'status') {
      console.log('Checking migration status...');
      const result = await db.migrate.status();
      console.log(`Migration status:`, result);
    } else {
      console.error('Usage: tsx scripts/migrate.ts <make|up|down|status> [migrationName]');
      process.exit(1);
    }
    
    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    await db.destroy();
    process.exit(1);
  }
}

runMigration();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Test connection
prisma.$connect()
  .then(() => console.log('✓ Prisma connected to database'))
  .catch((err) => {
    console.error('✗ Prisma connection failed:', err.message);
    process.exit(1);
  });

module.exports = prisma;

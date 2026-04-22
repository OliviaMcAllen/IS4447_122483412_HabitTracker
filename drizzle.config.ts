// Drizzle Kit configuration
// Based on Week 11 tutorial - defines database schema location and output
import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './habits.db',
  },
} satisfies Config;
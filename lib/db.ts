import postgres from 'postgres'

const globalForDb = globalThis as unknown as { sql: ReturnType<typeof postgres> }

export const sql = globalForDb.sql ?? postgres(process.env.DATABASE_URL!, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  max: 10,
})

if (process.env.NODE_ENV !== 'production') globalForDb.sql = sql

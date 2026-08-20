import { neon } from '@neondatabase/serverless'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noopSql = async (..._args: any[]) => []
// eslint-disable-next-line @typescript-eslint/no-explicit-any
noopSql.transaction = async (..._args: any[]) => []

export const sql = process.env.DATABASE_URL
  ? neon(process.env.DATABASE_URL)
  : noopSql

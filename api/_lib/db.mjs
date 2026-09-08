import postgres from 'postgres';
let sql;
export function getSql(env = process.env) { if (!sql) sql = postgres(env.DATABASE_URL, { max: 5, idle_timeout: 20 }); return sql; }
export async function inTransaction(sql, fn) { return sql.begin(fn); }

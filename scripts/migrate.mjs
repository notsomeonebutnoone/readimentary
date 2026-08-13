import fs from 'node:fs/promises';
import path from 'node:path';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required to run migrations.');
  process.exitCode = 1;
} else {
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  try {
    const migrationsDir = path.resolve('migrations');
    const files = (await fs.readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort();
    for (const file of files) {
      const migration = await fs.readFile(path.join(migrationsDir, file), 'utf8');
      await sql.unsafe(migration);
      console.log(`Applied ${file}`);
    }
  } finally {
    await sql.end();
  }
}

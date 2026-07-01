import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Client } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;

if (!url) {
  console.log("v2 schema: no database url, skip.");
  process.exit(0);
}

if (process.env.CHAINTRACE_SKIP_V2_SCHEMA_MIGRATION === "true") {
  console.log("v2 schema: migration skipped by env.");
  process.exit(0);
}

const sqlText = await readFile(resolve(process.cwd(), "database/schema-v2.1.sql"), "utf8");
const client = new Client(url);

try {
  console.log("v2 schema: applying schema file.");
  await client.connect();
  await client.query(sqlText);
  console.log("v2 schema: done.");
} catch (error) {
  console.error("v2 schema: failed.");
  console.error(error);
  process.exitCode = 1;
} finally {
  try {
    await client.end();
  } catch {}
}

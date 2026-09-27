#!/usr/bin/env node
/**
 * Prints upload_file MCP arguments as JSON lines (one per file).
 * Run uploads via Vercel MCP upload_file, then deploy with mcp-create-deploy-sha.json.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const uploadsDir = path.join(root, '.vercel-upload/uploads');
const teamId = 'team_W7VIeKlPs8cO6WydXFylHOdW';

const files = fs
  .readdirSync(uploadsDir)
  .filter((f) => f.endsWith('.json'))
  .sort();

for (const name of files) {
  const u = JSON.parse(fs.readFileSync(path.join(uploadsDir, name), 'utf8'));
  const line = {
    teamId,
    contentLength: u.size,
    xVercelDigest: u.sha,
    requestBody: u.data,
    _file: u.file,
  };
  process.stdout.write(JSON.stringify(line) + '\n');
}
